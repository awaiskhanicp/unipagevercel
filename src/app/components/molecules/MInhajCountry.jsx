import Container from "../atoms/Container";
import Heading from "../atoms/Heading";

function MinhajCountry() {
 const countries = [
   { src: "/assets/ic.png", label: "Italy" },
   { src: "/assets/uc.png", label: "UK" },
   { src: "/assets/fc.png", label: "France" },
   { src: "/assets/tc.png", label: "Turkey" },
   { src: "/assets/cc.png", label: "Canada" },
   { src: "/assets/cyc.png", label: "Cyprus" },
   { src: "/assets/co.png", label: "Other" },
 ];

 return (
   <div className="bg-[#E7F1F2] py-[50px] px-4">
     <Container>
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-[20px] justify-items-center">
       {countries.map((country, index) => (
         <div key={index} className="flex flex-col items-center text-center">
           <img
             src={country.src}
             alt={country.label}
             className="w-full max-h-[75px] object-contain"
           />
           <div className="mt-[10px]">
           <Heading>
           {country.label}
           </Heading>
           </div>
         </div>
       ))}
     </div>
     </Container>
   </div>
 );
}

export default MinhajCountry;
