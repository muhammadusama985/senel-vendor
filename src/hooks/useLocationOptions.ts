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
        // The cities JSON contains every settlement (villages included).
        // For the dropdown we keep only ONE entry per state/region so the
        // user picks a state, not a hamlet. This trims tens of thousands
        // of entries down to ~16-80 manageable options.
        const seen = new Set<string>();
        const deduped: CityOption[] = [];
        for (const entry of data) {
          const key = entry.stateCode || entry.name;
          if (key && !seen.has(key)) {
            seen.add(key);
            deduped.push(entry);
          }
        }
        if (active) setCities(deduped);
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
