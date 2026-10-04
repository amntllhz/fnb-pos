export const categories = [
    { value: 'PEDAS', label: 'Pedas' },
    { value: 'GURIH', label: 'Gurih' },
    { value: 'MANIS', label: 'Manis' },
    { value: 'SEGAR', label: 'Segar' },
] as const

export type Category = (typeof categories)[number]