'use client';

import React from 'react';
import Container from '../../components/atoms/Container';
import VisitvisaCompanyInfo from '../../components/molecules/VisitvisaCompanyInfo';
import AllVisaDestination from '../../components/organisms/AllVisaDestinations';
import Client from '../../components/molecules/Client';
import VisaApply from '../../components/molecules/VisaApply';
import OurOffice from '../../components/molecules/OurOffices';

const VisitVisa = () => {
  return (
    <div className="">
      <VisitvisaCompanyInfo/>
      <Container>
        <div className="text-center complete-page-spaceing bottom-session-space banner-bottom-space">
          <AllVisaDestination/>
          <Client/>
          <VisaApply/>
          <OurOffice/>
        </div>
      </Container>
    </div>
  );
};

export default VisitVisa;