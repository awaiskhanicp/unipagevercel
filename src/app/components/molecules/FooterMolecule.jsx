import Button from "../atoms/Button";
import Button2 from "../atoms/Button2";
import Paragraph from "../atoms/Paragraph";

const FooterMolecule = () => {
  return (
    <div className="text-center space-y-4">
      <div className="mb-[10px] xl:w-[70%] lg:w-[70%] md:w-[75%] sm:w-[90%] w-[100%] mx-auto">
        <Paragraph>
          Sunrise international education consultancy private limited built the
          Universities Page app as a Free app. This SERVICE is provided by
          sunrise international education consultancy private limited at no cost
          and is intended for use as is.
        </Paragraph>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button>
          <select className="">
            <option>Select Universities</option>
          </select>
        </Button>
        <Button2>
          <select className="">
            <option>Select Subject</option>
          </select>
        </Button2>
      </div>
    </div>
  );
};

export default FooterMolecule;
