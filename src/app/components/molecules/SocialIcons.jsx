// import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";





// export const SocialIcons = () => (
//   <div className=" grid xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-5 sm:grid-cols-5 grid-cols-5 gap-4 text-sm">
//     <a className="flex items-center text-[14px] gap-[10px]" href="https://www.facebook.com/universitiespagelahore"><div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]"><FaFacebook /></div> <div className=" md:block hidden">Facebook</div></a>
//     <a className="flex items-center text-[14px] gap-[10px]" href="https://twitter.com/UniversitiesPa1"><div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]"><FaTwitter /></div> <div className=" md:block hidden">Twitter</div></a>
//     <a className="flex items-center text-[14px] gap-[10px]" href="https://linkedin.com/in/universities-page-4728301b5"><div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]"><FaLinkedin /></div> <div className=" md:block hidden">LinkedIn</div></a>
//     <a className="flex items-center text-[14px] gap-[10px]" href="https://www.instagram.com/universitiespage_official/"><div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]"><FaInstagram /></div><div className=" md:block hidden">Instagram</div> </a>
//     <a className="flex items-center text-[14px] gap-[10px]" href="https://whatsapp.com/channel/0029Va7vJOYJkK79737At844"><div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]"><FaWhatsapp /></div> <div className=" md:block hidden">Whatsapp</div></a>
//   </div>
// ); 



import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";

export const SocialIcons = () => (
  <div className="grid xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-5 sm:grid-cols-5 grid-cols-5 gap-4 text-sm">
    {/* Facebook */}
    <a 
      className="flex items-center text-[14px] gap-[10px]" 
      href="https://www.facebook.com/universitiespagelahore" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Facebook page"
      title="Facebook"
    >
      <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
        <FaFacebook />
      </div>
      <div className="md:block hidden">Facebook</div>
    </a>

    {/* Twitter */}
    <a 
      className="flex items-center text-[14px] gap-[10px]" 
      href="https://twitter.com/UniversitiesPa1" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Twitter profile"
      title="Twitter"
    >
      <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
        <FaTwitter />
      </div>
      <div className="md:block hidden">Twitter</div>
    </a>

    {/* LinkedIn */}
    <a 
      className="flex items-center text-[14px] gap-[10px]" 
      href="https://linkedin.com/in/universities-page-4728301b5" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our LinkedIn page"
      title="LinkedIn"
    >
      <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
        <FaLinkedin />
      </div>
      <div className="md:block hidden">LinkedIn</div>
    </a>

    {/* Instagram */}
    <a 
      className="flex items-center text-[14px] gap-[10px]" 
      href="https://www.instagram.com/universitiespage_official/" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Instagram profile"
      title="Instagram"
    >
      <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
        <FaInstagram />
      </div>
      <div className="md:block hidden">Instagram</div>
    </a>

    {/* WhatsApp */}
    <a 
      className="flex items-center text-[14px] gap-[10px]" 
      href="https://whatsapp.com/channel/0029Va7vJOYJkK79737At844" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      title="WhatsApp"
    >
      <div className="bg-[var(--brand-color)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-[16px]">
        <FaWhatsapp />
      </div>
      <div className="md:block hidden">WhatsApp</div>
    </a>
  </div>
);
