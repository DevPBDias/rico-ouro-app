export interface Buy {
  rgn: string;
  date: string;
  value: string;
  payment_type: string;
  status: string;
  entry: string;
  installments_to_pay: number;
  installments_paid: number;
}

export const BUY_MOCK: Buy[] = [
  {
    rgn: "INDI 172",
    date: "15/10/2023",
    value: "R$ 1.500,00",
    payment_type: "Cartão de Crédito",
    status: "Pago",
    entry: "R$ 500,00",
    installments_to_pay: 0,
    installments_paid: 2,
  },
  {
    rgn: "MARC 45",
    date: "20/11/2023",
    value: "R$ 2.300,50",
    payment_type: "Boleto",
    status: "Pendente",
    entry: "R$ 300,00",
    installments_to_pay: 5,
    installments_paid: 1,
  },
];
