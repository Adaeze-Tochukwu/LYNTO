export interface UkRegion {
  name: string
  councils: string[]
}

export interface UkCountry {
  name: string
  regions: UkRegion[]
}

export const UK_COUNTRIES: UkCountry[] = [
  {
    name: 'England',
    regions: [
      {
        name: 'London',
        councils: [
          'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley', 'Camden',
          'City of London', 'Croydon', 'Ealing', 'Enfield', 'Greenwich', 'Hackney',
          'Hammersmith and Fulham', 'Haringey', 'Harrow', 'Havering', 'Hillingdon',
          'Hounslow', 'Islington', 'Kensington and Chelsea', 'Kingston upon Thames',
          'Lambeth', 'Lewisham', 'Merton', 'Newham', 'Redbridge', 'Richmond upon Thames',
          'Southwark', 'Sutton', 'Tower Hamlets', 'Waltham Forest', 'Wandsworth', 'Westminster',
        ],
      },
      {
        name: 'North East',
        councils: [
          'County Durham', 'Darlington', 'Gateshead', 'Hartlepool', 'Middlesbrough',
          'Newcastle upon Tyne', 'North Tyneside', 'Northumberland', 'Redcar and Cleveland',
          'South Tyneside', 'Stockton-on-Tees', 'Sunderland',
        ],
      },
      {
        name: 'North West',
        councils: [
          'Blackburn with Darwen', 'Blackpool', 'Bolton', 'Burnley', 'Bury', 'Carlisle',
          'Cheshire East', 'Cheshire West and Chester', 'Chorley', 'Fylde', 'Halton',
          'Hyndburn', 'Knowsley', 'Lancaster', 'Liverpool', 'Manchester', 'Oldham',
          'Pendle', 'Preston', 'Ribble Valley', 'Rochdale', 'Rossendale', 'Salford',
          'Sefton', 'South Ribble', 'St Helens', 'Stockport', 'Tameside', 'Trafford',
          'Warrington', 'West Lancashire', 'Wigan', 'Wirral', 'Wyre',
        ],
      },
      {
        name: 'Yorkshire and the Humber',
        councils: [
          'Barnsley', 'Bradford', 'Calderdale', 'Craven', 'Doncaster',
          'East Riding of Yorkshire', 'Hambleton', 'Harrogate', 'Kingston upon Hull',
          'Kirklees', 'Leeds', 'North East Lincolnshire', 'North Lincolnshire',
          'Richmondshire', 'Rotherham', 'Ryedale', 'Scarborough', 'Selby',
          'Sheffield', 'Wakefield', 'York',
        ],
      },
      {
        name: 'East Midlands',
        councils: [
          'Amber Valley', 'Ashfield', 'Bassetlaw', 'Blaby', 'Bolsover', 'Boston',
          'Broxtowe', 'Charnwood', 'Chesterfield', 'Corby', 'Daventry', 'Derby',
          'East Lindsey', 'East Northamptonshire', 'Erewash', 'Gedling', 'Harborough',
          'Hinckley and Bosworth', 'Kettering', 'Leicester', 'Lincoln', 'Mansfield',
          'Melton', 'Newark and Sherwood', 'North East Derbyshire', 'North Kesteven',
          'North West Leicestershire', 'Northampton', 'Nottingham', 'Oadby and Wigston',
          'Rushcliffe', 'Rutland', 'South Derbyshire', 'South Holland', 'South Kesteven',
          'South Northamptonshire', 'Wellingborough', 'West Lindsey',
        ],
      },
      {
        name: 'West Midlands',
        councils: [
          'Birmingham', 'Bromsgrove', 'Cannock Chase', 'Coventry', 'Dudley',
          'East Staffordshire', 'Herefordshire', 'Lichfield', 'Malvern Hills',
          'Newcastle-under-Lyme', 'North Warwickshire', 'Nuneaton and Bedworth',
          'Redditch', 'Rugby', 'Sandwell', 'Shropshire', 'Solihull', 'South Staffordshire',
          'Stafford', 'Staffordshire Moorlands', 'Stoke-on-Trent', 'Stratford-on-Avon',
          'Tamworth', 'Telford and Wrekin', 'Walsall', 'Warwick', 'Wolverhampton',
          'Worcester', 'Wychavon', 'Wyre Forest',
        ],
      },
      {
        name: 'East of England',
        councils: [
          'Bedford', 'Braintree', 'Brentwood', 'Cambridge', 'Castle Point',
          'Central Bedfordshire', 'Chelmsford', 'Colchester', 'East Cambridgeshire',
          'East Hertfordshire', 'East Suffolk', 'Epping Forest', 'Fenland',
          'Great Yarmouth', 'Hertsmere', 'Huntingdonshire', 'Ipswich',
          'Kings Lynn and West Norfolk', 'Luton', 'Maldon', 'Mid Suffolk',
          'North Hertfordshire', 'North Norfolk', 'Norwich', 'Peterborough',
          'South Cambridgeshire', 'Southend-on-Sea', 'St Albans', 'Tendring',
          'Three Rivers', 'Thurrock', 'Uttlesford', 'Watford', 'Welwyn Hatfield', 'West Suffolk',
        ],
      },
      {
        name: 'South East',
        councils: [
          'Arun', 'Ashford', 'Basingstoke and Deane', 'Bracknell Forest', 'Brighton and Hove',
          'Canterbury', 'Chichester', 'Crawley', 'Dartford', 'Dover', 'East Hampshire',
          'Eastbourne', 'Elmbridge', 'Epsom and Ewell', 'Fareham', 'Folkestone and Hythe',
          'Gosport', 'Gravesham', 'Guildford', 'Hart', 'Hastings', 'Horsham',
          'Isle of Wight', 'Lewes', 'Maidstone', 'Medway', 'Milton Keynes', 'Mole Valley',
          'New Forest', 'Portsmouth', 'Reading', 'Reigate and Banstead', 'Rother',
          'Runnymede', 'Rushmoor', 'Sevenoaks', 'Slough', 'South Bucks', 'Southampton',
          'Spelthorne', 'Surrey Heath', 'Swale', 'Tandridge', 'Thanet',
          'Tonbridge and Malling', 'Tunbridge Wells', 'Waverley', 'Wealden',
          'Winchester', 'Windsor and Maidenhead', 'Woking', 'Wokingham', 'Worthing',
        ],
      },
      {
        name: 'South West',
        councils: [
          'Bath and North East Somerset', 'Bournemouth Christchurch and Poole', 'Bristol',
          'Cornwall', 'Cotswold', 'Devon', 'Dorset', 'East Devon', 'Exeter',
          'Forest of Dean', 'Gloucester', 'Mid Devon', 'North Devon', 'North Somerset',
          'Plymouth', 'Sedgemoor', 'Somerset West and Taunton', 'South Gloucestershire',
          'South Hams', 'Stroud', 'Swindon', 'Teignbridge', 'Tewkesbury', 'Torbay',
          'Torridge', 'West Devon', 'Wiltshire',
        ],
      },
    ],
  },
  {
    name: 'Wales',
    regions: [
      {
        name: 'North Wales',
        councils: ['Conwy', 'Denbighshire', 'Flintshire', 'Gwynedd', 'Isle of Anglesey', 'Wrexham'],
      },
      {
        name: 'Mid Wales',
        councils: ['Ceredigion', 'Powys'],
      },
      {
        name: 'South East Wales',
        councils: [
          'Blaenau Gwent', 'Caerphilly', 'Cardiff', 'Merthyr Tydfil',
          'Monmouthshire', 'Newport', 'Rhondda Cynon Taf', 'Torfaen', 'Vale of Glamorgan',
        ],
      },
      {
        name: 'South West Wales',
        councils: ['Bridgend', 'Carmarthenshire', 'Neath Port Talbot', 'Pembrokeshire', 'Swansea'],
      },
    ],
  },
  {
    name: 'Scotland',
    regions: [
      {
        name: 'Highlands and Islands',
        councils: ['Argyll and Bute', 'Highland', 'Moray', 'Na h-Eileanan Siar', 'Orkney Islands', 'Shetland Islands'],
      },
      {
        name: 'North East Scotland',
        councils: ['Aberdeen City', 'Aberdeenshire'],
      },
      {
        name: 'Tayside',
        councils: ['Angus', 'Dundee City', 'Perth and Kinross'],
      },
      {
        name: 'Fife',
        councils: ['Fife'],
      },
      {
        name: 'Lothian',
        councils: ['City of Edinburgh', 'East Lothian', 'Midlothian', 'West Lothian'],
      },
      {
        name: 'Central Scotland',
        councils: ['Clackmannanshire', 'Falkirk', 'Stirling'],
      },
      {
        name: 'Strathclyde',
        councils: [
          'East Ayrshire', 'East Dunbartonshire', 'East Renfrewshire', 'Glasgow City',
          'Inverclyde', 'North Ayrshire', 'North Lanarkshire', 'Renfrewshire',
          'South Ayrshire', 'South Lanarkshire', 'West Dunbartonshire',
        ],
      },
      {
        name: 'Scottish Borders',
        councils: ['Scottish Borders'],
      },
      {
        name: 'Dumfries and Galloway',
        councils: ['Dumfries and Galloway'],
      },
    ],
  },
  {
    name: 'Northern Ireland',
    regions: [
      {
        name: 'Belfast',
        councils: ['Belfast'],
      },
      {
        name: 'South Eastern',
        councils: ['Ards and North Down', 'Lisburn and Castlereagh', 'Newry Mourne and Down'],
      },
      {
        name: 'Southern',
        councils: ['Armagh City Banbridge and Craigavon'],
      },
      {
        name: 'Northern',
        councils: ['Antrim and Newtownabbey', 'Causeway Coast and Glens', 'Mid and East Antrim', 'Mid Ulster'],
      },
      {
        name: 'Western',
        councils: ['Derry City and Strabane', 'Fermanagh and Omagh'],
      },
    ],
  },
]

export const POSITIONS = [
  'Manager',
  'Registered Manager',
  'Care Coordinator',
  'Team Lead',
  'Director',
  'CEO',
  'Operations Manager',
  'Accountant',
  'Administrator',
  'Other',
]
