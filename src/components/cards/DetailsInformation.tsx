interface DetailsInformationProps {
  label: string;
  value: string | number | undefined;
}

const DetailsInformation = ({ label, value }: DetailsInformationProps) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-sm font-medium uppercase">
        {label}
      </span>
      <span className="font-bold uppercase text-[#1162AE]">{value ?? "-"}</span>
    </div>
  );
};

export default DetailsInformation;
