export type Screen = "splash" | "login" | "home" | "animal" | "settings"

export interface Animal {
  id: string
  name: string
  currentWeight: number
  fatherName: string
  motherName: string
  birthDate: string
  age: string
  iABCZg: number
  deca: number
  pPercent: string
  fPercent: number
}

export interface SettingsOption {
  icon: any
  label: string
  description: string
}
