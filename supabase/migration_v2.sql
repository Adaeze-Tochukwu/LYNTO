-- ============================================================
-- LYNTO v2 Migration: Baseline Change Engine + Clinical Warning Score
-- Run in Supabase SQL Editor after migration_v1 (schema.sql)
-- ============================================================

-- ============================================================
-- EXTEND visit_entries with new scoring columns
-- ============================================================

alter table visit_entries
  add column if not exists health_risk_score integer,
  add column if not exists risk_band_label text,
  add column if not exists clinical_warning_score integer,
  add column if not exists clinical_warning_band text,
  add column if not exists clinical_warning_partial boolean default false,
  add column if not exists single_red_parameter boolean default false,
  add column if not exists scoring_engine_version text;

-- ============================================================
-- EXTEND alerts with clinical urgency flag
-- ============================================================

alter table alerts
  add column if not exists has_clinical_urgency boolean default false;

-- ============================================================
-- NEW TABLE: client_baselines
-- Each update creates a new row; previous rows have is_current = false
-- ============================================================

create table if not exists client_baselines (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  is_current boolean not null default true,

  -- Demographics
  date_of_birth date,
  age_group text,

  -- Clinical baselines (stored as text option keys)
  usual_mobility_level text,
  usual_appetite text,
  usual_fluid_intake text,
  usual_communication_level text,
  usual_cognition_level text,
  usual_mood_behaviour text,
  usual_continence_pattern text,
  usual_gait_pattern text,

  -- Vital baselines (stored as free text ranges e.g. "95-99", "60-80")
  usual_oxygen_saturation text,
  usual_blood_pressure_range text,
  usual_pulse_range text,

  -- Risk flags
  falls_history text,
  medication_support_needs text,
  swallowing_difficulty boolean default false,
  catheter_use boolean default false,
  pressure_sore_risk boolean default false,
  palliative_or_end_of_life_status boolean default false,

  -- Notes
  baseline_notes text,

  -- Audit
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_by uuid references users(id),
  updated_at timestamptz not null default now(),
  update_reason text
);

-- Only one current baseline per client
create unique index if not exists idx_client_baselines_current
  on client_baselines(client_id) where is_current = true;

create index if not exists idx_client_baselines_client_id
  on client_baselines(client_id);

create index if not exists idx_client_baselines_agency_id
  on client_baselines(agency_id);

-- ============================================================
-- NEW TABLE: client_conditions
-- ============================================================

create table if not exists client_conditions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  condition_name text not null,
  severity text not null default 'unknown', -- mild | moderate | severe | unknown
  notes text,
  status text not null default 'active',    -- active | inactive
  added_by uuid not null references users(id),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_conditions_client_id
  on client_conditions(client_id);

create index if not exists idx_client_conditions_agency_id
  on client_conditions(agency_id);

-- ============================================================
-- NEW TABLE: visit_score_breakdowns
-- ============================================================

create table if not exists visit_score_breakdowns (
  id uuid primary key default uuid_generate_v4(),
  visit_entry_id uuid not null references visit_entries(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,

  -- Component scores
  base_symptom_score integer not null default 0,
  vital_sign_score integer not null default 0,
  baseline_change_score integer not null default 0,
  condition_adjustment_score integer not null default 0,
  trend_score integer not null default 0,
  high_risk_combination_score integer not null default 0,

  -- Final scores
  final_health_risk_score integer not null default 0,
  final_risk_level text not null default 'green',
  risk_band_label text not null default 'Green / Stable',

  -- Category scores (JSONB)
  category_scores jsonb not null default '{}',

  -- Reasons (JSONB arrays)
  score_reasons jsonb not null default '[]',
  baseline_change_reasons jsonb not null default '[]',
  condition_adjustment_reasons jsonb not null default '[]',
  trend_reasons jsonb not null default '[]',
  combination_reasons jsonb not null default '[]',

  -- Human-readable explanation
  explanation_text text,
  suggested_attention_level text,

  -- Clinical Warning Score
  clinical_warning_score integer not null default 0,
  clinical_warning_band text not null default 'Normal',
  clinical_warning_partial boolean not null default false,
  single_red_parameter boolean not null default false,
  clinical_parameter_breakdown jsonb not null default '{}',

  -- Engine version
  scoring_engine_version text not null default 'v2_baseline_plus_clinical_warning',

  created_at timestamptz not null default now()
);

create unique index if not exists idx_visit_score_breakdowns_visit_entry_id
  on visit_score_breakdowns(visit_entry_id);

create index if not exists idx_visit_score_breakdowns_client_id
  on visit_score_breakdowns(client_id);

create index if not exists idx_visit_score_breakdowns_agency_id
  on visit_score_breakdowns(agency_id);

-- ============================================================
-- NEW TABLE: alert_outcomes
-- ============================================================

create table if not exists alert_outcomes (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid not null references alerts(id) on delete cascade,
  visit_entry_id uuid not null references visit_entries(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  reviewed_by uuid not null references users(id),

  -- Outcome
  outcome text,
  -- no_further_action | continue_monitoring | family_contacted | gp_contacted |
  -- community_nurse_contacted | 111_contacted | 999_emergency | hospital_admission |
  -- medication_issue | suspected_uti | suspected_infection | fall_confirmed |
  -- care_plan_updated | baseline_updated | other

  -- Alert usefulness feedback
  was_alert_useful text,
  -- yes_correct_concern | partly_useful | no_false_alarm | needs_monitoring | unsure

  -- Follow-up
  follow_up_required boolean not null default false,
  follow_up_date date,
  outcome_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_alert_outcomes_alert_id
  on alert_outcomes(alert_id);

create index if not exists idx_alert_outcomes_agency_id
  on alert_outcomes(agency_id);

-- ============================================================
-- RLS: client_baselines
-- ============================================================

alter table client_baselines enable row level security;

create policy "manager_read_agency_baselines"
  on client_baselines for select
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_insert_agency_baselines"
  on client_baselines for insert
  with check (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_update_agency_baselines"
  on client_baselines for update
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "carer_read_assigned_client_baselines"
  on client_baselines for select
  using (
    exists(
      select 1 from carer_client_assignments
      where carer_id = auth.uid()
      and client_id = client_baselines.client_id
    )
  );

create policy "admin_read_all_baselines"
  on client_baselines for select
  using (is_platform_admin(auth.uid()));

-- ============================================================
-- RLS: client_conditions
-- ============================================================

alter table client_conditions enable row level security;

create policy "manager_read_agency_conditions"
  on client_conditions for select
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_insert_agency_conditions"
  on client_conditions for insert
  with check (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_update_agency_conditions"
  on client_conditions for update
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "carer_read_assigned_client_conditions"
  on client_conditions for select
  using (
    exists(
      select 1 from carer_client_assignments
      where carer_id = auth.uid()
      and client_id = client_conditions.client_id
    )
  );

create policy "admin_read_all_conditions"
  on client_conditions for select
  using (is_platform_admin(auth.uid()));

-- ============================================================
-- RLS: visit_score_breakdowns
-- ============================================================

alter table visit_score_breakdowns enable row level security;

create policy "manager_read_agency_score_breakdowns"
  on visit_score_breakdowns for select
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_insert_agency_score_breakdowns"
  on visit_score_breakdowns for insert
  with check (agency_id = get_user_agency_id(auth.uid()));

create policy "carer_read_own_score_breakdowns"
  on visit_score_breakdowns for select
  using (
    exists(
      select 1 from visit_entries
      where id = visit_score_breakdowns.visit_entry_id
      and carer_id = auth.uid()
    )
  );

create policy "admin_read_all_score_breakdowns"
  on visit_score_breakdowns for select
  using (is_platform_admin(auth.uid()));

-- ============================================================
-- RLS: alert_outcomes
-- ============================================================

alter table alert_outcomes enable row level security;

create policy "manager_read_agency_alert_outcomes"
  on alert_outcomes for select
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_insert_agency_alert_outcomes"
  on alert_outcomes for insert
  with check (agency_id = get_user_agency_id(auth.uid()));

create policy "manager_update_agency_alert_outcomes"
  on alert_outcomes for update
  using (agency_id = get_user_agency_id(auth.uid()));

create policy "admin_read_all_alert_outcomes"
  on alert_outcomes for select
  using (is_platform_admin(auth.uid()));

-- ============================================================
-- UPDATE trigger for alert_outcomes
-- ============================================================

create trigger update_alert_outcomes_updated_at
  before update on alert_outcomes
  for each row execute function update_updated_at();

create trigger update_client_conditions_updated_at
  before update on client_conditions
  for each row execute function update_updated_at();

-- ============================================================
-- UPDATE the alert creation trigger to include clinical urgency
-- The trigger now sets has_clinical_urgency based on
-- the visit_entry's clinical_warning_score and single_red_parameter
-- ============================================================

create or replace function create_alert_on_risk()
returns trigger as $$
begin
  if new.risk_level in ('amber', 'red') then
    insert into alerts (
      visit_entry_id, client_id, carer_id, agency_id, risk_level, has_clinical_urgency
    )
    values (
      new.id, new.client_id, new.carer_id, new.agency_id, new.risk_level,
      coalesce(new.clinical_warning_score >= 5, false) or coalesce(new.single_red_parameter, false)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- INSERT for visit_score_breakdowns: carers who own the visit
-- ============================================================

create policy "carer_insert_own_score_breakdowns"
  on visit_score_breakdowns for insert
  with check (
    exists(
      select 1 from visit_entries
      where id = visit_score_breakdowns.visit_entry_id
      and carer_id = auth.uid()
    )
  );
