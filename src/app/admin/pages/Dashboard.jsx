
import { useEffect, useState } from "react";
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Calendar, Bell, FileText } from "lucide-react";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    students: 0,
    consultants: 0,
    universities: 0,
    courses: 0,
    articles: 0,
    notifications: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Universities - get total count
        const uniRes = await fetch("/api/internal/university?limit=1");
        const uniData = await uniRes.json();
        console.log('University API response:', uniData);

        // Courses - get total count
        const courseRes = await fetch("/api/internal/course?limit=1");
        const courseData = await courseRes.json();
        console.log('Course API response:', courseData);

        // Articles - get total count
        const articleRes = await fetch("/api/internal/blogs?limit=1");
        const articleData = await articleRes.json();
        console.log('Article API response:', articleData);

        // Students - get total count from students table
        const studentRes = await fetch("/api/internal/students/count");
        const studentData = await studentRes.json();
        console.log('Student count API response:', studentData);

        // Consultants - get total count from consultants table
        const consultantRes = await fetch("/api/internal/consultants/count");
        const consultantData = await consultantRes.json();
        console.log('Consultant count API response:', consultantData);

        // Notifications - get total count
        const notificationRes = await fetch("/api/internal/notifications?limit=1");
        const notificationData = await notificationRes.json();
        console.log('Notification API response:', notificationData);

        setCounts({
          students: studentData.count || studentData.total || 0,
          consultants: consultantData.count || consultantData.total || 0,
          universities: uniData.total || uniData.data?.length || 0,
          courses: courseData.total || courseData.data?.length || 0,
          articles: articleData.total || articleData.data?.length || 0,
          notifications: notificationData.pagination?.totalItems || 0,
        });
        
        console.log('Final counts set:', {
          students: studentData.count || studentData.total || 0,
          consultants: consultantData.count || consultantData.total || 0,
          universities: uniData.total || uniData.data?.length || 0,
          courses: courseData.total || courseData.data?.length || 0,
          articles: articleData.total || articleData.data?.length || 0,
          notifications: notificationData.pagination?.totalItems || 0,
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
        // Set default values if API calls fail
        setCounts({
          students: 0,
          consultants: 0,
          universities: 0,
          courses: 0,
          articles: 0,
          notifications: 0,
        });
      }
    }
    fetchCounts();
  }, []);

  const stats = [
    { title: "Total Students", value: counts.students, icon: Users, color: "bg-blue-500",  },
    { title: "Total Consultants", value: counts.consultants, icon: Users, color: "bg-blue-300",  },
    { title: "Total University ", value: counts.universities, icon: GraduationCap, color: "bg-green-500",},
    { title: "Active Courses", value: counts.courses, icon: BookOpen, color: "bg-purple-500",  },
    { title: "Articles", value: counts.articles, icon: DollarSign, color: "bg-orange-500", },
    { title: "Notifications", value: counts.notifications, icon: Bell, color: "bg-red-500", }
  ];

  // const recentActivities = [
  //   { activity: "New student enrollment: John Doe", time: "2 minutes ago", type: "enrollment" },
  //   { activity: "Faculty meeting scheduled", time: "1 hour ago", type: "meeting" },
  //   { activity: "Course CS101 updated", time: "3 hours ago", type: "course" },
  //   { activity: "Payment received from Jane Smith", time: "5 hours ago", type: "payment" },
  //   { activity: "Library book returned", time: "1 day ago", type: "library" }
  // ];

  // const upcomingEvents = [
  //   { event: "Faculty Meeting", date: "Dec 15, 2024", time: "10:00 AM" },
  //   { event: "Student Orientation", date: "Dec 18, 2024", time: "2:00 PM" },
  //   { event: "Final Exams Begin", date: "Dec 20, 2024", time: "9:00 AM" },
  //   { event: "Holiday Break Starts", date: "Dec 23, 2024", time: "All Day" }
  // ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-[#0B6D76] rounded-lg p-6 text-white">
        <h1 className="md:text-3xl text-xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-blue-100">Here's what's happening at your university today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} bg-black p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Recent Activities */}
        {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div> */}
          {/* <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.activity}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div> */}
          {/* <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 mt-4 py-2 border-t border-gray-200">
            View All Activities
          </button>
        </div> */}

        {/* Upcoming Events */}
        {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div> */}
          {/* <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{event.event}</p>
                  <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                </div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
            ))}
          </div> */}
          {/* <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 mt-4 py-2 border-t border-gray-200">
            View Calendar
          </button>
        </div>
      </div> */}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Add Student", icon: Users, color: "bg-blue-500" },
            { name: "Add Faculty", icon: GraduationCap, color: "bg-green-500" },
            { name: "Create Course", icon: BookOpen, color: "bg-purple-500" },
            { name: "Generate Report", icon: FileText, color: "bg-orange-500" }
          ].map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className={`${action.color} p-3 rounded-lg mb-2`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
