import { Input } from "@/components/ui/input";

interface FormInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FormInput(props: FormInputProps) {
  return (
    <Input />
  );
}