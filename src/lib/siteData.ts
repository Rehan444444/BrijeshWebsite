import {
  Car,
  Cog,
  Cpu,
  Factory,
  Gauge,
  Link2,
  Ruler,
  Settings2,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Product {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const services: Service[] = [
  {
    title: 'Tool Room Development',
    description:
      'Design and build of dies, moulds, jigs, fixtures and press tools, backed by full tooling support for production runs.',
    icon: Wrench,
  },
  {
    title: 'CNC Job Works',
    description:
      'Turning, milling and machining on CNC equipment, from single prototypes to high-volume batches.',
    icon: Cog,
  },
  {
    title: 'Precision Component Manufacturing',
    description:
      'Tight-tolerance parts made to your drawings and checked against specification before every dispatch.',
    icon: Ruler,
  },
  {
    title: 'Automotive Components',
    description:
      'Shafts, spacers and drivetrain parts machined to the consistency and traceability automotive buyers expect.',
    icon: Car,
  },
  {
    title: 'Medical & Industrial Components',
    description:
      'Accurately machined parts for medical equipment and industrial systems where reliability is non-negotiable.',
    icon: Stethoscope,
  },
];

export const products: Product[] = [
  {
    title: 'Custom Wheel Spacers',
    description: 'Precision-machined spacers cut to your bolt pattern, offset and thickness.',
    icon: Gauge,
  },
  {
    title: 'Custom Transmission Shafts',
    description: 'Turned and milled shafts manufactured to your spline, diameter and length specs.',
    icon: Cog,
  },
  {
    title: 'Industrial Studs & Bolts',
    description: 'Studs and bolts in a range of grades, threads and lengths for demanding assemblies.',
    icon: Link2,
  },
  {
    title: 'Turbine Bolts',
    description: 'High-strength fasteners engineered for the heat and load of turbine applications.',
    icon: Factory,
  },
  
  {
    title: 'Industrial Components & Equipment',
    description: 'Custom components and equipment parts built around your application and drawings.',
    icon: Cpu,
  },
];

export const interestOptions: string[] = [
  ...services.map((service) => service.title),
  ...products.map((product) => product.title),
  'Other',
];

export const strengths: string[] = [
  'Built to your drawing, tolerance and material requirements',
  'In-house tool room for dies, fixtures and repeat-run tooling',
  'Prototype to production runs under one roof',
  'Consistent quality checks before every shipment',
];
