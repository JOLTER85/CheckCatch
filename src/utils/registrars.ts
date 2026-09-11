export interface RegistrarOption {
  name: string;
  url: string;
  color: string;
}

export function getRegistrarLinks(domain: string): RegistrarOption[] {
  const encoded = encodeURIComponent(domain);
  return [
    {
      name: 'Namecheap',
      url: `https://www.namecheap.com/domains/registration/results/?domain=${encoded}`,
      color: 'hover:text-orange-400',
    },
    {
      name: 'GoDaddy',
      url: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encoded}`,
      color: 'hover:text-emerald-400',
    },
    {
      name: 'Porkbun',
      url: `https://porkbun.com/checkout/search?q=${encoded}`,
      color: 'hover:text-pink-400',
    },
    {
      name: 'Google / Squarespace',
      url: `https://domains.squarespace.com/?query=${encoded}`,
      color: 'hover:text-blue-400',
    },
  ];
}
