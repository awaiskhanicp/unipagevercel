import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import DiscountOfferApplyNow from '../molecules/DiscountOfferApplyNow';
import DiscountOfferfirst from '../molecules/DiscountOfferfirst';

const DiscountOfferorgan = () => {
  return (
    <div className="">
     <section className="relative md:h-[50vh] sm:h-[50vh] md:pt-[0px] sm:pt-[90px] pt-[90px] h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/assets/disb.png"
        alt="Hero Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
        <Heading level={1}>
          <div className="text-white">Discount Offer</div>
        </Heading>
      </div>
    </section>
      <Container>
        <div className="complete-page-spaceing banner-bottom-space bottom-session-space">
        <DiscountOfferfirst/>
        <DiscountOfferApplyNow/>
        </div>
      </Container>
    </div>
  );
};

export default DiscountOfferorgan;




