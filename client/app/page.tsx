export default function Home() {

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black flex items-center">
      <div className="">
        <h2 className="text-6xl font-bold ml-28">
          Plan Your Next Semester!
        </h2>
        <p className="text-black/60 ml-28 mt-1">
          Use our course planner to figure out your courses for the next semester based on completed courses.
        </p>
        <div className="mt-5">
          <a className="text-white bg-black/80 rounded-md px-4 py-2 text-s hover:bg-black/70 ml-28 cursor-pointer" href="/checkCourse">
            Find my courses -{'>'}
          </a>
          <a className="text-black border border-solid hover:bg-black/5 rounded-md px-4 py-2 text-s ml-5 cursor-pointer" href="/checkCourse">
            GitHub Repo
          </a>
        </div>
      </div>
    </div>
  );
}