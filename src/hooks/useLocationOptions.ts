import { useEffect, useMemo, useState } from 'react';

interface CountryOption {
  name: string;
  isoCode: string;
}

interface CityOption {
  name: string;
  countryCode: string;
  stateCode?: string;
}

export const useLocationOptions = (countryName: string) => {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.name === countryName),
    [countries, countryName],
  );

  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      try {
        const response = await fetch('/location-data/countries.json');
        const data = (await response.json()) as CountryOption[];
        if (active) setCountries(data);
      } catch {
        if (active) setCountries([]);
      }
    };

    void loadCountries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCities = async () => {
      if (!selectedCountry?.isoCode) {
        setCities([]);
        return;
      }

      try {
        const response = await fetch(`/location-data/cities/${selectedCountry.isoCode}.json`);
        const data = (await response.json()) as CityOption[];
        if (active) setCities(data);
      } catch {
        if (active) setCities([]);
      }
    };

    void loadCities();

    return () => {
      active = false;
    };
  }, [selectedCountry?.isoCode]);

  return {
    countries,
    cities,
    selectedCountry,
  };
};
