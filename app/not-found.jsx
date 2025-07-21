import FuzzyText from "@/components/ui/FuzzyText";
export const metadata = {
  title: "404 Not Found",
  description: "The page you are looking for does not exist.",
};
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover={true}>
        404
      </FuzzyText>
      <div className="mt-5">
        <FuzzyText
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={true}
          fontSize="35px"
        >
          Not found
        </FuzzyText>
      </div>
    </div>
  );
}
