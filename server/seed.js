const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Issue = require('./models/Issue');

dotenv.config();

const dummyIssues = [
  // WATER
  {
    title: 'Severe Water Leakage from Cracked Underground Pipe',
    description: 'A main water line pipe appears to have burst or cracked under the sidewalk, leading to constant water gushing onto the road. Thousands of gallons are being wasted hourly, causing minor flooding and slippery road conditions.',
    category: 'water',
    location: '452 Pine Street, near City Park Entrance',
    status: 'open',
    latitude: 37.7739,
    longitude: -122.4184,
    images: ['/images/water_leak.png']
  },
  {
    title: 'Low Water Pressure & Rusty Discoloration in Residential Supply',
    description: 'Residents of the block are experiencing extremely low water pressure accompanied by a yellowish-brown rusty tint. This has been ongoing for 48 hours and raises health and safety concerns for daily usage.',
    category: 'water',
    location: 'Westside Apartments, Block B (Line 3)',
    status: 'in_progress',
    latitude: 37.7618,
    longitude: -122.4350,
    images: ['/images/water_leak.png']
  },
  {
    title: 'Broken Fire Hydrant Spraying Water onto Main Crossing',
    description: 'A municipal fire hydrant has been damaged (likely hit by a vehicle reversing) and is continuously spraying a high-pressure stream of water into the air, flooding the pedestrian crossing and reducing driver visibility.',
    category: 'water',
    location: 'Intersection of 5th Avenue and Oak Street',
    status: 'open',
    latitude: 37.7845,
    longitude: -122.4082,
    images: ['/images/water_leak.png']
  },
  {
    title: 'Clogged Storm Drain Causing Street Flooding',
    description: 'The main storm water intake drain is entirely blocked by accumulated leaves, plastic debris, and dirt. Due to the recent light rain, the water is pooling deep across the road lane, creating a hydroplaning hazard.',
    category: 'water',
    location: '782 Walnut Lane, adjacent to the public library',
    status: 'resolved',
    latitude: 37.7892,
    longitude: -122.4014,
    images: ['/images/water_leak.png']
  },

  // ROAD
  {
    title: 'Deep Pothole Grid on Highland Highway lane',
    description: 'A cluster of three extremely deep pothole structures has developed in the left-hand lane of Highland Highway. Vehicles are swerving abruptly to avoid damage, creating a serious hazard for high-speed traffic.',
    category: 'road',
    location: 'Highland Highway, Section 4 (opposite Shell Station)',
    status: 'in_progress',
    latitude: 37.7684,
    longitude: -122.4482,
    images: ['/images/road_pothole.png']
  },
  {
    title: 'Crumbling Asphalt and Major Cracks on School Zone Road',
    description: 'The asphalt surface on the school access road is completely crumbling away, forming deep gravel trenches. School buses and parents dropping off children are struggling to navigate the severe dips safely.',
    category: 'road',
    location: 'St. Jude School Zone Access Road, East Gate',
    status: 'open',
    latitude: 37.7788,
    longitude: -122.4322,
    images: ['/images/road_pothole.png']
  },
  {
    title: 'Damaged Speed Bumps Causing Vehicle Scrapes',
    description: 'The rubberized speed hump near the residential estate has come loose. Part of the metal bolt framework is exposed and pointing upwards, which is popping tires and scraping the underside of crossing cars.',
    category: 'road',
    location: 'Greenwood Estate Entrance, Road 2',
    status: 'resolved',
    latitude: 37.7552,
    longitude: -122.4285,
    images: ['/images/road_pothole.png']
  },
  {
    title: 'Missing Lane Markings on Newly Resurfaced Boulevard',
    description: 'Following the repaving of the boulevard three weeks ago, the dividing white and yellow lines have not been repainted. Drivers are frequently drifting out of lanes, causing near-collisions during heavy evening traffic.',
    category: 'road',
    location: 'Grand Valley Boulevard, 2-mile stretch between Exit 9 & 10',
    status: 'open',
    latitude: 37.7634,
    longitude: -122.4098,
    images: ['/images/road_pothole.png']
  },

  // ELECTRICITY
  {
    title: 'Streetlight Blackout across 14th Avenue Grid',
    description: 'An entire block of streetlights (roughly 5 poles) is completely dark. The area is pitch black at night, making it highly unsafe for pedestrians walking home from the transit station and increasing security concerns.',
    category: 'electricity',
    location: '14th Avenue & Elm Crossing intersection',
    status: 'open',
    latitude: 37.7725,
    longitude: -122.4447,
    images: ['/images/exposed_wires.png']
  },
  {
    title: 'Exposed High-Voltage Cable Near Children\'s Playground',
    description: 'A metal utility service hatch door has been broken or stolen, leaving high-voltage wires exposed at the base of the lamppost directly adjacent to the sandbox and children\'s play area. Extreme hazard!',
    category: 'electricity',
    location: 'Civic Family Park, near the swing set and central path',
    status: 'open',
    latitude: 37.7597,
    longitude: -122.4271,
    images: ['/images/exposed_wires.png']
  },
  {
    title: 'Damaged Transformer Emitting Sparks and Loud Buzzing',
    description: 'The pole-mounted electrical transformer is making an intense, fluctuating buzzing sound and periodically emitting orange sparks. Several nearby houses are experiencing rapid voltage fluctuations and light flickering.',
    category: 'electricity',
    location: 'Rear of 109 Riverview Drive',
    status: 'in_progress',
    latitude: 37.7621,
    longitude: -122.4502,
    images: ['/images/exposed_wires.png']
  },
  {
    title: 'Leaning Utility Pole After Minor Vehicle Collision',
    description: 'A wooden electricity pole was struck by a commercial vehicle. The pole is now leaning at a dangerous 20-degree angle over the pavement. The power lines connected to it are pulled extremely tight and may snap.',
    category: 'electricity',
    location: '67 Northside Way, outside the hardware store',
    status: 'resolved',
    latitude: 37.7915,
    longitude: -122.4153,
    images: ['/images/exposed_wires.png']
  },

  // SANITATION
  {
    title: 'Overflowing Public Sanitation Bin & Illegal Dumping',
    description: 'The main public trash bin is completely overflowing, and people have started dumping large cardboard boxes and household furniture around it. It has created an eyesore, a foul smell, and is attracting pests.',
    category: 'sanitation',
    location: 'Alleyway behind Broadway Commercial Complex',
    status: 'resolved',
    latitude: 37.7831,
    longitude: -122.4182,
    images: ['/images/trash_overflow.png']
  },
  {
    title: 'Blocked Sewer Line Emitting Foul Odor on Commercial Street',
    description: 'A sewage manhole on the commercial avenue is bubbling up dirty, foul-smelling liquid. The toxic smell is affecting business operations, outdoor seating areas, and pedestrian traffic along the street.',
    category: 'sanitation',
    location: '210 Market Street, near the Coffee Bean cafe',
    status: 'in_progress',
    latitude: 37.7812,
    longitude: -122.4115,
    images: ['/images/trash_overflow.png']
  },
  {
    title: 'Accumulation of Construction Debris on Public Sidewalk',
    description: 'Large piles of broken drywall, concrete slabs, and metallic pipes have been dumped illegally on the public sidewalk. Wheelchair users and parents with strollers are forced to walk on the busy street lane.',
    category: 'sanitation',
    location: 'Outside 304 Maplewood Avenue construction site',
    status: 'open',
    latitude: 37.7654,
    longitude: -122.4225,
    images: ['/images/trash_overflow.png']
  },
  {
    title: 'Litter and Uncollected Plastic Waste in Neighborhood Park',
    description: 'Following the weekend community festival, the park grounds are heavily littered with plastic bottles, plates, and wrappers. The local garbage bins were not emptied, leaving trash scattered across lawns and ponds.',
    category: 'sanitation',
    location: 'Sunrise Recreational Lake and Park grounds',
    status: 'closed',
    latitude: 37.7712,
    longitude: -122.4582,
    images: ['/images/trash_overflow.png']
  },

  // OTHER
  {
    title: 'Fallen Tree Branch Obstructing Bicycle Lane',
    description: 'A large branch from an oak tree has fallen during last night\'s storm and is completely blocking the designated bicycle lane. Cyclists are forced to ride in the main vehicle lane to bypass it.',
    category: 'other',
    location: 'Maple Boulevard, Southbound Lane near Mile 12',
    status: 'closed',
    latitude: 37.7681,
    longitude: -122.4624,
    images: ['/images/fallen_tree.png']
  },
  {
    title: 'Faded and Vandalized Public Park Benches',
    description: 'Multiple wooden benches in the community square are severely deteriorated, splinting, and covered in graffiti. Some benches have broken slats, making them completely unusable for senior citizens who sit there.',
    category: 'other',
    location: 'Town Square Central Plaza',
    status: 'open',
    latitude: 37.7795,
    longitude: -122.4112,
    images: ['/images/fallen_tree.png']
  },
  {
    title: 'Broken Swing Set and Safety Chain in Community Playground',
    description: 'One of the children\'s metal swing sets has a snapped support chain. The remaining swings are also squeaking heavily, and the safety rubber ground padding has peeled away, leaving hard concrete exposed.',
    category: 'other',
    location: 'Oakridge Family Park & Playground',
    status: 'in_progress',
    latitude: 37.7495,
    longitude: -122.4382,
    images: ['/images/fallen_tree.png']
  },
  {
    title: 'Malfunctioning Pedestrian Walk Signal at Main Intersection',
    description: 'The pedestrian crossing signal button does not register requests, and the visual indicator remains stuck on the "Don\'t Walk" hand indefinitely. Pedestrians are crossing blindly against heavy traffic.',
    category: 'other',
    location: 'Busy crossing at 3rd Street & Lexington Avenue',
    status: 'resolved',
    latitude: 37.7865,
    longitude: -122.4214,
    images: ['/images/fallen_tree.png']
  }
];

async function seedDatabase() {
  console.log('--- STARTING DATABASE SEEDING ---');
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');

    // 1. Ensure we have at least one reporter user
    let user = await User.findOne({ email: 'citizen_demo@example.com' });
    if (!user) {
      console.log('Creating demo citizen user...');
      user = await User.create({
        name: 'Jane Doe (Citizen)',
        email: 'citizen_demo@example.com',
        password: 'password123',
        role: 'citizen'
      });
      console.log('Demo citizen user created successfully!');
    }

    // 2. Clean up previous demo issues to avoid clutter
    console.log('Clearing any existing demo issues reported by this user...');
    await Issue.deleteMany({ reportedBy: user._id });

    // 3. Insert issues
    console.log('Inserting dummy issues...');
    const issuesToInsert = dummyIssues.map(issue => ({
      ...issue,
      reportedBy: user._id,
      upvotes: []
    }));

    const insertedIssues = await Issue.insertMany(issuesToInsert);
    console.log(`✅ Successfully seeded ${insertedIssues.length} dummy issues into the database!`);

    // Let's add some mock upvotes to make the interface look alive!
    console.log('Adding sample upvotes to dummy issues...');
    const mockUsers = await User.find({ email: { $ne: 'citizen_demo@example.com' } }).limit(5);
    
    if (mockUsers.length > 0) {
      for (let i = 0; i < insertedIssues.length; i++) {
        const issue = insertedIssues[i];
        // Give some random number of upvotes
        const upvoteCount = Math.floor(Math.random() * (mockUsers.length + 1));
        const upvoters = mockUsers.slice(0, upvoteCount).map(u => u._id);
        await Issue.findByIdAndUpdate(issue._id, { upvotes: upvoters });
      }
      console.log('✅ Mock upvotes populated!');
    }

  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    console.log('--- DATABASE SEEDING COMPLETED ---');
  }
}

seedDatabase();
