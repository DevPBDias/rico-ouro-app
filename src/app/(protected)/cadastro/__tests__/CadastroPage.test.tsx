import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CadastroPage from "../page";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useFarms } from "@/hooks/db/farms/useFarms";

const mockPush = vi.fn();

// Mock hooks
vi.mock("@/hooks/db/animals/useCreateAnimal", () => ({
  useCreateAnimal: vi.fn(),
}));

vi.mock("@/hooks/db/animals/useAnimals", () => ({
  useAnimals: vi.fn(),
}));

vi.mock("@/hooks/db/farms/useFarms", () => ({
  useFarms: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock UI Components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value, disabled }: any) => {
    // Basic mock that handles value change on click of items
    return <div data-testid="mock-select">{children}</div>;
  },
  SelectTrigger: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

describe("CadastroPage", () => {
  const mockCreateAnimal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useCreateAnimal as any).mockReturnValue({
      createAnimal: mockCreateAnimal,
      isLoading: false,
    });

    (useAnimals as any).mockReturnValue({
      animals: [],
    });

    (useFarms as any).mockReturnValue({
      farms: [{ id: "farm-1", farm_name: "Fazenda Teste" }],
      isLoading: false,
    });
  });

  it("should render registration form", () => {
    render(<CadastroPage />);
    expect(screen.getByPlaceholderText(/Digitar RGN/i)).toBeInTheDocument();
    // Using getAllByText and checking the first one which should be the label
    expect(screen.getAllByText(/Sexo/i)[0]).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cadastrar/i })
    ).toBeInTheDocument();
  });

  it("should show validation error when RGN is empty", async () => {
    render(<CadastroPage />);

    const submitButton = screen.getByRole("button", { name: /Cadastrar/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/RGN é obrigatório/i)).toBeInTheDocument();
  });

  it("should show error when RGN is already registered", async () => {
    (useAnimals as any).mockReturnValue({
      animals: [{ rgn: "123" }],
    });

    render(<CadastroPage />);

    const rgnInput = screen.getByPlaceholderText(/Digitar RGN/i);
    fireEvent.change(rgnInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /Cadastrar/i });
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/Este RGN já está cadastrado/i)
    ).toBeInTheDocument();
  });
});
