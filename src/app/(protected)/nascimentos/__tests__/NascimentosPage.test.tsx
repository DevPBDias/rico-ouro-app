import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NascimentosPage from "../page";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useCreateAnimalWeight } from "@/hooks/db/animal_weights/useCreateAnimalWeight";

const mockPush = vi.fn();

// Mock hooks
vi.mock("@/hooks/db/animals/useCreateAnimal", () => ({
  useCreateAnimal: vi.fn(),
}));

vi.mock("@/hooks/db/animals/useUpdateAnimal", () => ({
  useUpdateAnimal: vi.fn(),
}));

vi.mock("@/hooks/db/animals/useAnimals", () => ({
  useAnimals: vi.fn(),
}));

vi.mock("@/hooks/db/animal_weights/useCreateAnimalWeight", () => ({
  useCreateAnimalWeight: vi.fn(),
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
  Select: ({ children, onValueChange, value, name }: any) => {
    return (
      <div data-testid={`mock-select-${name || "unnamed"}`}>
        {children}
        <button onClick={() => onValueChange("Macho")}>Set Macho</button>
        <button onClick={() => onValueChange("Fêmea")}>Set Fêmea</button>
      </div>
    );
  },
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectGroup: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

describe("NascimentosPage", () => {
  const mockCreateAnimal = vi.fn();
  const mockUpdateAnimal = vi.fn();
  const mockCreateWeight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useCreateAnimal as any).mockReturnValue({
      createAnimal: mockCreateAnimal,
      isLoading: false,
    });

    (useUpdateAnimal as any).mockReturnValue({
      updateAnimal: mockUpdateAnimal,
      isLoading: false,
    });

    (useAnimals as any).mockReturnValue({
      animals: [],
      isLoading: false,
    });

    (useCreateAnimalWeight as any).mockReturnValue({
      createWeight: mockCreateWeight,
      isLoading: false,
    });
  });

  it("should render registration form and show secondary fields after sex selection", async () => {
    render(<NascimentosPage />);

    expect(screen.getByText(/Sexo do Animal/i)).toBeInTheDocument();

    // Initially, RGN should not be visible (it's inside the conditional block)
    expect(screen.queryByLabelText(/^RGN$/i)).not.toBeInTheDocument();

    // Select Sex
    fireEvent.click(screen.getByText("Set Macho"));

    // Now other fields should appear
    expect(screen.getByLabelText(/^RGN$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data de Nascimento/i)).toBeInTheDocument();
  });

  it("should call createAnimal and createWeight on valid submission", async () => {
    render(<NascimentosPage />);

    // Select Sex
    fireEvent.click(screen.getByText("Set Macho"));

    // Fill form
    fireEvent.change(screen.getByLabelText(/^RGN$/i), {
      target: { value: "BORN-001" },
    });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), {
      target: { value: "2024-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/Peso \(kg\)/i), {
      target: { value: "35,5" },
    });
    fireEvent.change(screen.getByLabelText(/RGN da Mãe/i), {
      target: { value: "MOTHER-001" },
    });

    // Submit
    fireEvent.click(
      screen.getByRole("button", { name: /Cadastrar Nascimento/i }),
    );

    await waitFor(() => {
      expect(mockCreateAnimal).toHaveBeenCalledWith(
        expect.objectContaining({
          rgn: "BORN-001",
          sex: "M",
          born_date: "2024-01-01",
          mother_rgn: "MOTHER-001",
        }),
      );

      expect(mockCreateWeight).toHaveBeenCalledWith(
        expect.objectContaining({
          rgn: "BORN-001",
          value: 35.5,
          born_metric: true,
        }),
      );
    });

    // Success modal should be visible
    expect(screen.getByText(/Sucesso!/i)).toBeInTheDocument();
  });

  it("should register birth with temporary RGN when RGN is blank", async () => {
    const today = new Date();
    // In the code: const [_, month, day] = formData.data.split("-");
    const todayIso = today.toISOString().split("T")[0];
    const [_, month, day] = todayIso.split("-");
    const expectedTempRgn = `T-MOTHER-001-${day}${month}`;

    render(<NascimentosPage />);

    // Select Sex
    fireEvent.click(screen.getByText("Set Macho"));

    // Fill form (leave RGN blank)
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), {
      target: { value: todayIso },
    });
    fireEvent.change(screen.getByLabelText(/Peso \(kg\)/i), {
      target: { value: "35,5" },
    });
    fireEvent.change(screen.getByLabelText(/RGN da Mãe/i), {
      target: { value: "MOTHER-001" },
    });

    // Submit
    fireEvent.click(
      screen.getByRole("button", { name: /Cadastrar Nascimento/i }),
    );

    await waitFor(() => {
      expect(mockCreateAnimal).toHaveBeenCalledWith(
        expect.objectContaining({
          rgn: expectedTempRgn,
          mother_rgn: "MOTHER-001",
        }),
      );
    });

    // Success modal should be visible
    expect(screen.getByText(/Sucesso!/i)).toBeInTheDocument();
    expect(screen.getByText(expectedTempRgn)).toBeInTheDocument();
  });
});
