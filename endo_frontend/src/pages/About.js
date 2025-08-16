import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: "Nguyen Tan Tan",
    role: "Project Lead (PL)",
    email: "s3956465@endodetect.com",
  },
  {
    name: "Bui Quang Kien",
    role: "Data Scientist (DS)",
    email: "s3926751@endodetect.com",
  },
  {
    name: "Nguyen Phu Nhat Nam",
    role: "Software Developer (SD)",
    email: "s3928848@endodetect.com",
  },
  {
    name: "Pham Quang Huy",
    role: "Software Developer (SD)",
    email: "s3950664@endodetect.com",
  },
  {
    name: "Mai Chi Nghi",
    role: "Software Developer (SD)",
    email: "s3864219@endodetect.com",
  },
];

export default function About() {
  return (
    <div className="bg-clear-sky min-h-screen px-4 py-12 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">About Us</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full sm:w-4/5 md:w-2/3 lg:w-1/2 space-y-6">
        <p className="text-base sm:text-lg">
          EndoDetect is a collaborative project aimed at improving early detection of gastrointestinal polyps using advanced AI.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Macrohard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="flex flex-col items-center bg-clear-sky rounded-lg p-4 shadow">
              <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full object-cover mb-4" />
              <h3 className="text-lg font-bold">{member.name}</h3>
              <p className="text-sm">{member.role}</p>
              <a href={`mailto:${member.email}`} className="text-sm mt-2 underline">
                {member.email}
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}