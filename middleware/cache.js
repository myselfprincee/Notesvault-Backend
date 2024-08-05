import NodeCache from 'node-cache';

const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export default myCache;