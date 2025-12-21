import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openAuthModal } from '../../redux/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;