import React from 'react';
import { useRoute } from '@react-navigation/native';

const useParams = () => {
  const route = useRoute();
  return route.params;
};

export default useParams;
