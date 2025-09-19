import HouseholdSelector from "@/components/expenses/HouseholdSelector";

function Expenses() {
  return (
    <section className="container mx-auto mt-1 flex flex-col items-center lg:w-[80rem]">
      <div className="text-center text-3xl font-stretch-70% mb-6 drop-shadow-lg tracking-wide">
        💸 Expenses
      </div>

      <HouseholdSelector />

      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Commodi
        consequuntur dolores eaque accusantium vitae maiores in explicabo
        laborum est placeat fugit molestias repellat, nesciunt voluptatum et
        dolorum, nihil autem quam.
      </p>
    </section>
  );
}

export default Expenses;
