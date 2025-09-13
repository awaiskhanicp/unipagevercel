import Container from "../../components/atoms/Container";
import Heading from "../../components/atoms/Heading";
import JobOpportunitiesorgan from "../../components/organisms/Job-Opportunitiesorgan";
import UniversityCard from "../../components/atoms/UniversityCard";

function JobOpportunities() {
  const universities = [
    {
      name: "Apply",
      image:
        "/assets/ap.png",
      description:
        "Apply for our posted job opportunity by submitting your resume. We look forward to reviewing your application and considering you for the position.",
    },
    {
      name: "Review",
      image:
        "/assets/re.png",
      description:
        "Once we receive your resume, our HR team will review thoroughly to see if your expertise matches our required position.",
    },
    {
      name: "Interviews",
      image:
        "/assets/inter.png",
      description:
        "Our competency based interviews conducted by subject matter experts would tell if you have what it takes to work with us",
    },
  ];

  return (
    <div className="min-h-screen bg-white complete-page-spaceing banner-bottom-space bottom-session-space">
      {/* Top Job Opportunities Section */}
      <JobOpportunitiesorgan />

      {/* Universities Section */}
      <section className="bg-white">
        <Container>
          <div>
            <div className="text-center mb-16">
              <Heading level={3}>
              Hiring  <span className="text-[#0B6D76]">Process</span>
              </Heading>
            </div>

            <div className="relative flex xl:justify-between lg:justify-between md:justify-center justify-center z-50 sm:justify-center items-center gap-10 flex-wrap md:flex-nowrap">
              {universities.map((university, index) => (
                <div
                  key={university.name}
                  className="flex flex-col items-center relative"
                >
                  {/* University Card */}
                  <UniversityCard
                    name={university.name}
                    image={university.image}
                    description={university.description}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />

                  {/* Dot image between cards */}
                  {index < universities.length - 1 && (
                    <img
                      src="/assets/dot.png"
                      alt="connector"
                      className="mt-4 md:mt-0 md:absolute md:top-[30%] md:left-[100%] md:translate-x-4 w-[100%] h-auto hidden md:block"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default JobOpportunities;
