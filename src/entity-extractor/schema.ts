import { z } from 'zod';

export const NamedEntitiesSchema = z.object({
  people: z.array(z.string()).describe('Names of people mentioned (staff, guests, etc.)'),
  locations: z.array(z.string()).describe('Specific places mentioned (restaurants, bars, landmarks, neighborhoods)'),
  amenities: z.array(z.string()).describe('Specific amenities or facilities mentioned (pool, gym, spa, restaurant names)'),
  brands: z.array(z.string()).describe('Brand names mentioned (WiFi providers, TV brands, etc.)'),
  dates: z.array(z.string()).describe('Specific dates or time periods mentioned'),
  organizations: z.array(z.string()).describe('Organizations or companies mentioned'),
});

export type NamedEntities = z.infer<typeof NamedEntitiesSchema>;
