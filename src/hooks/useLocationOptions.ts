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

type MainCitiesMap = Record<string, string[]>;

export const useLocationOptions = (countryName: string) => {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [mainCities, setMainCities] = useState<MainCitiesMap>({});

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

  // Curated list of MAIN cities per country. Vendors only need a small,
  // predictable set of well-known cities when filling in their store /
  // product address — the full settlement dataset is way too long for
  // a form dropdown. Loaded once and reused for every country selection.
  useEffect(() => {
    let active = true;

    const loadMainCities = async () => {
      try {
        const response = await fetch('/location-data/main-cities.json');
        const data = (await response.json()) as MainCitiesMap;
        if (active) setMainCities(data || {});
      } catch {
        if (active) setMainCities({});
      }
    };

    void loadMainCities();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCities = () => {
      if (!selectedCountry?.isoCode) {
        setCities([]);
        return;
      }

      // Only show MAIN cities for the selected country. If a country has
      // no entry in the curated list we fall back to the full settlement
      // JSON (kept under /location-data/cities) so vendors from smaller
      // markets still see options — but the list stays limited.
      const isoCode = selectedCountry.isoCode;
      const curated = mainCities[isoCode];

      if (Array.isArray(curated) && curated.length > 0) {
        const list: CityOption[] = curated.map((name) => ({
          name,
          countryCode: isoCode,
        }));
        if (active) setCities(list);
        return;
      }

      // Fallback: fetch the per-country JSON but still trim it down to the
      // first entry per state so the dropdown doesn't drown the vendor in
      // hundreds of villages/hamlets.
      const fetchFallback = async () => {
        try {
          const response = await fetch(`/location-data/cities/${isoCode}.json`);
          const data = (await response.json()) as CityOption[];
          const seen = new Set<string>();
          const deduped: CityOption[] = [];
          for (const entry of data) {
            const key = entry.stateCode || entry.name;
            if (key && !seen.has(key)) {
              seen.add(key);
              deduped.push(entry);
              // Cap the fallback at 30 so the dropdown stays usable.
              if (deduped.length >= 30) break;
            }
          }
          if (active) setCities(deduped);
        } catch {
          if (active) setCities([]);
        }
      };

      void fetchFallback();
    };

    loadCities();

    return () => {
      active = false;
    };
  }, [selectedCountry?.isoCode, mainCities]);

  return {
    countries,
    cities,
    selectedCountry,
  };
};
