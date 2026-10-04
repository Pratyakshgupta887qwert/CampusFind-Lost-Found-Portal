import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { lostItemsApi, foundItemsApi, claimsApi, usersApi } from '../services/api';
import { useAuth } from './AuthContext';

const ItemContext = createContext();

const mapLostItem = (item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  location: item.location,
  date: item.dateLost ? item.dateLost.split('T')[0] : '',
  time: item.timeLost || '12:00 PM',
  status: item.status,
  reward: item.reward || '',
  urgency: item.urgency || 'Medium',
  description: item.description,
  image: item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  reporterName: item.reporterName || 'Campus Member',
  reporterId: item.userId,
  reporterContact: item.reporterEmail || '',
  reporterPhone: item.reporterPhone || '',
  referenceCode: item.referenceCode || `CF-LST-${(item.id || '').slice(0, 6).toUpperCase()}`,
  holdingStation: 'Unrecovered'
});

const mapFoundItem = (item) => ({
  id: item.id,
  title: item.title,
  category: item.category,
  location: item.location,
  date: item.dateFound ? item.dateFound.split('T')[0] : '',
  time: item.timeFound || '12:00 PM',
  status: item.status,
  custodyLocation: item.holdingLocation || 'Main Campus Safety HQ',
  finderName: item.finderName || 'Campus Member',
  finderContact: item.finderEmail || '',
  finderPhone: item.finderPhone || '',
  finderId: item.userId,
  description: item.description,
  image: item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  referenceCode: item.referenceCode || `CF-FND-${(item.id || '').slice(0, 6).toUpperCase()}`,
  verificationHint: item.verificationHint || ''
});

export const ItemProvider = ({ children }) => {
  const { user, token } = useAuth();

  // Purge any legacy mock items stored in localStorage
  useEffect(() => {
    localStorage.removeItem('campusfind_lost_items');
    localStorage.removeItem('campusfind_found_items');
    localStorage.removeItem('campusfind_claims');
  }, []);

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active items from PostgreSQL database
  const refreshItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        lostItemsApi.getAll({ pageSize: 100 }),
        foundItemsApi.getAll({ pageSize: 100 })
      ]);

      if (lostRes?.data?.items) {
        // Only active items (exclude Recovered and Closed)
        const activeLost = lostRes.data.items
          .filter(item => item.status !== 'Recovered' && item.status !== 'Closed')
          .map(mapLostItem);
        setLostItems(activeLost);
      } else {
        setLostItems([]);
      }

      if (foundRes?.data?.items) {
        // Only active items (exclude Returned and Closed)
        const activeFound = foundRes.data.items
          .filter(item => item.status !== 'Returned' && item.status !== 'Closed')
          .map(mapFoundItem);
        setFoundItems(activeFound);
      } else {
        setFoundItems([]);
      }
    } catch (err) {
      console.error('Failed to load items from PostgreSQL:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch logged in user's posts from PostgreSQL database
  const refreshMyItems = useCallback(async () => {
    if (!token) {
      setMyLostItems([]);
      setMyFoundItems([]);
      return;
    }
    try {
      const [myLostRes, myFoundRes] = await Promise.all([
        usersApi.getMyLostItems(),
        usersApi.getMyFoundItems()
      ]);

      if (myLostRes?.data) {
        const mapped = Array.isArray(myLostRes.data)
          ? myLostRes.data.map(mapLostItem)
          : [];
        setMyLostItems(mapped);
      }
      if (myFoundRes?.data) {
        const mapped = Array.isArray(myFoundRes.data)
          ? myFoundRes.data.map(mapFoundItem)
          : [];
        setMyFoundItems(mapped);
      }
    } catch (err) {
      console.error('Failed to load user posts from PostgreSQL:', err);
    }
  }, [token]);

  // Load items on mount and on token change
  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    refreshMyItems();
  }, [refreshMyItems]);

  // Add Lost Item to PostgreSQL
  const addLostItem = async (itemData) => {
    const apiPayload = {
      title: itemData.title,
      description: itemData.description,
      category: itemData.category,
      location: itemData.location,
      dateLost: itemData.date ? new Date(itemData.date).toISOString() : new Date().toISOString(),
      timeLost: itemData.time || '12:00 PM',
      additionalInformation: itemData.description,
      reward: itemData.reward || null,
      urgency: itemData.urgency || 'Medium',
      imageUrls: itemData.image ? [itemData.image] : []
    };

    const res = await lostItemsApi.create(apiPayload);
    const item = res?.data;
    if (!item) {
      throw new Error(res?.message || 'Failed to create lost item');
    }

    const mapped = mapLostItem(item);
    setLostItems(prev => [mapped, ...prev]);
    setMyLostItems(prev => [mapped, ...prev]);
    return mapped;
  };

  // Add Found Item to PostgreSQL
  const addFoundItem = async (itemData) => {
    const apiPayload = {
      title: itemData.title,
      description: itemData.description,
      category: itemData.category,
      location: itemData.location,
      dateFound: itemData.date ? new Date(itemData.date).toISOString() : new Date().toISOString(),
      timeFound: itemData.time || '12:00 PM',
      holdingLocation: itemData.custodyLocation || 'Main Campus Safety HQ',
      verificationHint: itemData.verificationHint || null,
      imageUrls: itemData.image ? [itemData.image] : []
    };

    const res = await foundItemsApi.create(apiPayload);
    const item = res?.data;
    if (!item) {
      throw new Error(res?.message || 'Failed to create found item');
    }

    const mapped = mapFoundItem(item);
    setFoundItems(prev => [mapped, ...prev]);
    setMyFoundItems(prev => [mapped, ...prev]);
    return mapped;
  };

  // Update Item Status: Lost -> Recovered, Found -> Returned
  // Disappears from active website listings, but remains in the database and in user's posts.
  const resolveItem = async (itemId, type = 'lost') => {
    if (type === 'lost') {
      await lostItemsApi.updateStatus(itemId, 'Recovered');
      // Remove from active public listings
      setLostItems(prev => prev.filter(item => item.id !== itemId));
      // Keep in user's posts with updated status
      setMyLostItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'Recovered' } : item
      ));
    } else {
      await foundItemsApi.updateStatus(itemId, 'Returned');
      // Remove from active public listings
      setFoundItems(prev => prev.filter(item => item.id !== itemId));
      // Keep in user's posts with updated status
      setMyFoundItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'Returned' } : item
      ));
    }
  };

  const submitClaim = async (foundItemId, claimDetails) => {
    try {
      const res = await claimsApi.create({
        foundItemId,
        message: claimDetails.proofDescription,
        proofDetails: claimDetails.serialOrUniqueMark
      });
      if (res?.data) {
        setClaims(prev => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to submit claim:', err);
    }
  };

  return (
    <ItemContext.Provider value={{
      lostItems,
      foundItems,
      myLostItems,
      myFoundItems,
      claims,
      isLoading,
      refreshItems,
      refreshMyItems,
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
