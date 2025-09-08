'use client';

import Heading from "../atoms/Heading";
import visaSteps from '../../utils/visaSteps';

const VisaApply = () => {
  return (
    <section className="text-center">
      <div className="text-bottom-space">
        <Heading level={3}>
          Visa in 3 <span className="text-[#0B6D76]">Easy Steps</span>
        </Heading>
      </div>
      <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 justify-center items-center gap-10">
        {visaSteps.map((step, index) => (
          <div key={index} className="text-center ">
            <div className="relative w-40 h-40 mx-auto right mb-4">
              <div className="w-[57px] h-[57px] bg-[var(--brand-color)] border-[9px] text-white rounded-full flex items-center justify-center absolute -top-4 -left-4">
                0{index + 1}
              </div>
              <img src={step.img} alt={step.title} className="w-full h-full rounded-full object-cover" />
            </div>
            <h4 className="font-semibold text-lg">{step.title}</h4>
            <p className="text-sm text-gray-600 mt-2">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VisaApply;