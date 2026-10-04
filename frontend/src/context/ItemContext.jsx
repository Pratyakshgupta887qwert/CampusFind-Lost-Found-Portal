import React, { createContext, useContext, useState, useEffect } from 'react';
import { lostItemsApi, foundItemsApi, claimsApi } from '../services/api';

const ItemContext = createContext();

const INITIAL_LOST_ITEMS = [
  {
    id: 'lost_101',
    title: 'Space Gray MacBook Pro 14" (M3)',
    category: 'Electronics',
    location: 'Main Library — 3rd Floor Quiet Study Pods',
    date: '2026-10-02',
    time: '4:30 PM',
    status: 'Active',
    reward: '$50 Reward',
    urgency: 'High',
    description: 'Left on desk 34 near the window. Has a GitHub Octocat sticker and a Rust programming sticker on the lid. Gray Tom Bihn sleeve.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Alex Rivera',
    reporterId: 'usr_8829',
    reporterContact: 'alex.rivera@campus.edu',
    referenceCode: 'CF-LST-9021',
    holdingStation: 'Unrecovered'
  },
  {
    id: 'lost_102',
    title: 'Titanium Apple Watch Ultra with Orange Ocean Band',
    category: 'Electronics',
    location: 'Campus Recreation Center — Locker Room A',
    date: '2026-10-03',
    time: '08:15 AM',
    status: 'Active',
    reward: 'Coffee on me!',
    urgency: 'Medium',
    description: 'Left on the bench while showering. Bright orange band, cracked screen protector on bottom-right corner.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Marcus Chen',
    reporterId: 'usr_7712',
    reporterContact: 'm.chen@campus.edu',
    referenceCode: 'CF-LST-9022',
    holdingStation: 'Unrecovered'
  },
  {
    id: 'lost_103',
    title: 'Brown Leather Bellroy Wallet + Student ID Card',
    category: 'Keys & Wallets',
    location: 'University Dining Commons — Booth 12',
    date: '2026-10-01',
    time: '1:15 PM',
    status: 'Match Found',
    reward: 'Gratitude & $20',
    urgency: 'Urgent',
    description: 'Contains University Student ID for Alex Rivera, metro pass, and debit card. Desperately need student ID for midterms!',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Alex Rivera',
    reporterId: 'usr_8829',
    reporterContact: 'alex.rivera@campus.edu',
    referenceCode: 'CF-LST-9023',
    holdingStation: 'Campus Security Desk B'
  },
  {
    id: 'lost_104',
    title: 'Sony WH-1000XM5 Matte Black Headphones',
    category: 'Electronics',
    location: 'Engineering Building 4 — Room 302',
    date: '2026-09-30',
    time: '5:45 PM',
    status: 'Active',
    reward: '$30 Cash',
    urgency: 'High',
    description: 'Black carrying case with auxiliary cable and airline adapter inside. Has small silver initials "SK" engraved on inside headband.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Sarah Kim',
    reporterId: 'usr_5541',
    reporterContact: 'skim@campus.edu',
    referenceCode: 'CF-LST-9024',
    holdingStation: 'Unrecovered'
  },
  {
    id: 'lost_105',
    title: 'North Face Borealis Backpack (Navy & Yellow)',
    category: 'Bags & Backpacks',
    location: 'Science Lecture Hall A (Auditorium)',
    date: '2026-10-02',
    time: '11:00 AM',
    status: 'Active',
    reward: 'Warm Thanks',
    urgency: 'Medium',
    description: 'Contains Organic Chemistry textbook, spiral notebooks with purple covers, and pencil case with Muji pens.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    reporterName: 'Elena Rostova',
    reporterId: 'usr_3310',
    reporterContact: 'e.rostova@campus.edu',
    referenceCode: 'CF-LST-9025',
    holdingStation: 'Unrecovered'
  },
  {
    id: 'lost_106',
    title: 'Car Keys with Subaru Fob & Neon Green Lanyard',
    category: 'Keys & Wallets',
    location: 'North Campus Parking Structure Level 2',
    date: '2026-10-03',
    time: '09:30 AM',
    status: 'Active',
    reward: '$40 Reward',
    urgency: 'Urgent',
    description: 'Subaru push-to-start key fob with gym membership barcode card and neon green lanyard saying "HACKATHON 2025".',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    reporterName: 'David Bradley',
    reporterId: 'usr_1092',
    reporterContact: 'dbradley@campus.edu',
    referenceCode: 'CF-LST-9026',
    holdingStation: 'Unrecovered'
  }
];

const INITIAL_FOUND_ITEMS = [
  {
    id: 'fnd_201',
    title: 'Found: Hydro Flask 32oz Cobalt Blue Water Bottle',
    category: 'Accessories',
    location: 'Student Union Plaza — Outdoor Wooden Benches',
    date: '2026-10-03',
    time: '12:40 PM',
    status: 'In Custody',
    custodyLocation: 'Student Union Info Desk (Room 101)',
    finderName: 'Officer Davis',
    finderRole: 'Campus Security',
    description: 'Blue wide-mouth Hydro Flask covered with National Parks and NASA stickers. Has a slight dent on bottom rim.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    referenceCode: 'CF-FND-4011',
    verificationHint: 'Owner must confirm which specific National Park stickers are on the back side.'
  },
  {
    id: 'fnd_202',
    title: 'Found: Brown Leather Wallet (Name: Alex Rivera)',
    category: 'Keys & Wallets',
    location: 'University Dining Commons',
    date: '2026-10-01',
    time: '02:00 PM',
    status: 'Awaiting Claim',
    custodyLocation: 'Campus Safety HQ — Lost Property Safe',
    finderName: 'Dining Staff Maria',
    finderRole: 'Staff',
    description: 'Turned into dining staff after lunch rush. Handed over to Campus Safety for verified student release.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    referenceCode: 'CF-FND-4012',
    verificationHint: 'Must present secondary photo identification or verify student number.'
  },
  {
    id: 'fnd_203',
    title: 'Found: Apple AirPods Pro 2 in Spigen Rugged Case',
    category: 'Electronics',
    location: 'Library 1st Floor — Collaborative Cafe Area',
    date: '2026-10-02',
    time: '3:15 PM',
    status: 'In Custody',
    custodyLocation: 'Main Library Helpdesk Counter',
    finderName: 'Jordan Lee',
    finderRole: 'Student',
    description: 'Black carbon fiber textured case. Charging LED lights up green. Found tucked between couch cushions.',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    referenceCode: 'CF-FND-4013',
    verificationHint: 'Will be paired via Bluetooth with claimant device to verify device name.'
  },
  {
    id: 'fnd_204',
    title: 'Found: Texas Instruments TI-84 Plus CE Graphing Calculator',
    category: 'Books & Supplies',
    location: 'Mathematics Hall Room 108',
    date: '2026-10-02',
    time: '10:00 AM',
    status: 'In Custody',
    custodyLocation: 'Math Dept Secretary Office',
    finderName: 'Prof. Harrison',
    finderRole: 'Faculty',
    description: 'Teal blue color with white slide cover. Slide cover has a Pokémon sticker on the inside.',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    referenceCode: 'CF-FND-4014',
    verificationHint: 'State the Pokémon character sticker inside the sliding cover.'
  },
  {
    id: 'fnd_205',
    title: 'Found: Ray-Ban Clubmaster Classic Sunglasses with Black Case',
    category: 'Accessories',
    location: 'Campus Amphitheater Steps',
    date: '2026-10-03',
    time: '1:30 PM',
    status: 'With Finder',
    custodyLocation: 'Kept by Student Finder (Engineering Bldg)',
    finderName: 'Chloe Taylor',
    finderRole: 'Student',
    description: 'Black and gold rim sunglasses in dark brown leather case with cleaning cloth.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    referenceCode: 'CF-FND-4015',
    verificationHint: 'State prescription status or lens color code printed on left arm.'
  }
];

export const ItemProvider = ({ children }) => {
  const [lostItems, setLostItems] = useState(() => {
    try {
      const saved = localStorage.getItem('campusfind_lost_items');
      return saved ? JSON.parse(saved) : INITIAL_LOST_ITEMS;
    } catch {
      return INITIAL_LOST_ITEMS;
    }
  });

  const [foundItems, setFoundItems] = useState(() => {
    try {
      const saved = localStorage.getItem('campusfind_found_items');
      return saved ? JSON.parse(saved) : INITIAL_FOUND_ITEMS;
    } catch {
      return INITIAL_FOUND_ITEMS;
    }
  });

  const [claims, setClaims] = useState(() => {
    try {
      const saved = localStorage.getItem('campusfind_claims');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('campusfind_lost_items', JSON.stringify(lostItems));
  }, [lostItems]);

  useEffect(() => {
    localStorage.setItem('campusfind_found_items', JSON.stringify(foundItems));
  }, [foundItems]);

  useEffect(() => {
    localStorage.setItem('campusfind_claims', JSON.stringify(claims));
  }, [claims]);

  // Try fetching live data from backend API on startup
  useEffect(() => {
    async function loadApiData() {
      try {
        const [lostRes, foundRes] = await Promise.all([
          lostItemsApi.getAll({ pageSize: 50 }),
          foundItemsApi.getAll({ pageSize: 50 })
        ]);

        if (lostRes?.data?.items && lostRes.data.items.length > 0) {
          const apiLost = lostRes.data.items.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            location: item.location,
            date: item.dateLost ? item.dateLost.split('T')[0] : '2026-10-03',
            time: item.timeLost || '12:00 PM',
            status: item.status,
            reward: item.reward,
            urgency: item.urgency,
            description: item.description,
            image: item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
            reporterName: item.reporterName,
            reporterId: item.userId,
            reporterContact: item.reporterEmail,
            referenceCode: item.referenceCode || `CF-LST-${item.id.slice(0, 6)}`
          }));
          setLostItems(apiLost);
        }

        if (foundRes?.data?.items && foundRes.data.items.length > 0) {
          const apiFound = foundRes.data.items.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            location: item.location,
            date: item.dateFound ? item.dateFound.split('T')[0] : '2026-10-03',
            time: item.timeFound || '12:00 PM',
            status: item.status,
            custodyLocation: item.holdingLocation || 'Campus Safety HQ',
            finderName: item.finderName,
            description: item.description,
            image: item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
            referenceCode: item.referenceCode || `CF-FND-${item.id.slice(0, 6)}`,
            verificationHint: item.verificationHint
          }));
          setFoundItems(apiFound);
        }
      } catch {
        // Backend not running, use current state
      }
    }

    loadApiData();
  }, []);

  const addLostItem = async (itemData) => {
    // Try sending to ASP.NET API
    try {
      const apiPayload = {
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        location: itemData.location,
        dateLost: itemData.date ? new Date(itemData.date).toISOString() : new Date().toISOString(),
        timeLost: itemData.time,
        additionalInformation: itemData.description,
        reward: itemData.reward,
        urgency: itemData.urgency || 'Medium',
        imageUrls: itemData.image ? [itemData.image] : []
      };
      const res = await lostItemsApi.create(apiPayload);
      if (res?.data?.id) {
        const item = res.data;
        const mapped = {
          ...itemData,
          id: item.id,
          referenceCode: item.referenceCode,
          status: item.status
        };
        setLostItems(prev => [mapped, ...prev]);
        return mapped;
      }
    } catch {
      // Local fallback
    }

    const newItem = {
      ...itemData,
      id: `lost_${Date.now()}`,
      date: itemData.date || new Date().toISOString().split('T')[0],
      time: itemData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active',
      referenceCode: `CF-LST-${Math.floor(1000 + Math.random() * 9000)}`,
      holdingStation: 'Unrecovered'
    };
    setLostItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const addFoundItem = async (itemData) => {
    // Try sending to ASP.NET API
    try {
      const apiPayload = {
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        location: itemData.location,
        dateFound: itemData.date ? new Date(itemData.date).toISOString() : new Date().toISOString(),
        timeFound: itemData.time,
        holdingLocation: itemData.custodyLocation,
        verificationHint: itemData.verificationHint,
        imageUrls: itemData.image ? [itemData.image] : []
      };
      const res = await foundItemsApi.create(apiPayload);
      if (res?.data?.id) {
        const item = res.data;
        const mapped = {
          ...itemData,
          id: item.id,
          referenceCode: item.referenceCode,
          status: item.status
        };
        setFoundItems(prev => [mapped, ...prev]);
        return mapped;
      }
    } catch {
      // Local fallback
    }

    const newItem = {
      ...itemData,
      id: `fnd_${Date.now()}`,
      date: itemData.date || new Date().toISOString().split('T')[0],
      time: itemData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'In Custody',
      referenceCode: `CF-FND-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setFoundItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const submitClaim = async (foundItemId, claimDetails) => {
    try {
      const res = await claimsApi.create({
        foundItemId: foundItemId.length > 20 ? foundItemId : null,
        message: claimDetails.proofDescription,
        proofDetails: claimDetails.serialOrUniqueMark
      });
      if (res?.data) {
        setClaims(prev => [res.data, ...prev]);
      }
    } catch {
      // Local fallback
    }

    const newClaim = {
      id: `clm_${Date.now()}`,
      foundItemId,
      ...claimDetails,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending Verification'
    };
    setClaims(prev => [newClaim, ...prev]);

    setFoundItems(prev => prev.map(item => 
      item.id === foundItemId ? { ...item, status: 'Claim Under Review' } : item
    ));

    return newClaim;
  };

  const resolveItem = async (itemId, type = 'lost') => {
    try {
      if (type === 'lost') {
        await lostItemsApi.updateStatus(itemId, 'Recovered');
      } else {
        await foundItemsApi.updateStatus(itemId, 'Returned');
      }
    } catch {
      // Local fallback
    }

    if (type === 'lost') {
      setLostItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'Resolved / Recovered' } : item
      ));
    } else {
      setFoundItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'Resolved / Handed Over' } : item
      ));
    }
  };

  return (
    <ItemContext.Provider value={{
      lostItems,
      foundItems,
      claims,
      addLostItem,
      addFoundItem,
      submitClaim,
      resolveItem
    }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => useContext(ItemContext);
