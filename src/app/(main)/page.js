import React from "react";
import Hero from "../components/organisms/Hero";
import PopularUniversities from "../components/organisms/PopularUniversities";
import PopularCourses from "../components/organisms/PopularCourses";
import LatestArticles from "../components/organisms/LatestArticles";
import "../globals.css"; // Import global styles
import BrowseCourses from "../components/organisms/BrowseCourses";
import CountryList from "../components/molecules/country";
import OurTeam from "../components/atoms/OurTeam";

export default function Home() {
  return (
    <div>
      <Hero />
       
      <div className=" complete-page-spaceing banner-bottom-space bg-white mt-30">
        <PopularUniversities />
        {/* country  */}
        <CountryList />
        <PopularCourses />
        <BrowseCourses />
        <LatestArticles />
        {/* <OurTeam/> */}
      </div>
    </div>
  );
}