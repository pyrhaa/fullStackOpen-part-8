import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ME, ALL_BOOKS } from '../queries';

const Recommend = () => {
  const meResult = useQuery(ME);
  const [me, setMe] = useState(null);
};

export default Recommend;
