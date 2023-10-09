import { normalize } from '@geolonia/normalize-japanese-addresses';
import sha1 from 'crypto-js/sha1';
import extractAddress from './extractAddress';

interface MetaAddress {
  nja_pref: string;
  nja_city: string;
  nja_town: string;
  nja_addr: string;
  nja_lat: number | null;
  nja_lng: number | null;
  nja_level: number;
  address_sha1: string;
}

export default async function extractSemanticAddress(orgAddress: string): Promise<MetaAddress> {
  const address = extractAddress(orgAddress);
  const { pref, city, town, addr, lat, lng, level } = await normalize(address);
  const addressSha1 = sha1(pref + city + town + addr).toString();
  return {
    nja_pref: pref,
    nja_city: city,
    nja_town: town,
    nja_addr: addr,
    nja_lat: lat,
    nja_lng: lng,
    nja_level: level,
    address_sha1: addressSha1,
  };
}
