import { Outlet } from "react-router-dom";

function UnauthenticatedLayout() {
  return (
    <>
      <section className="p-4 bg-white sm:p-6 lg:p-10">
        <h1 className="text-4xl sm:text-5xl lg:text-8xl">
          RoomMate 🏘{" "}
          <span className="block text-base sm:text-lg lg:text-2xl font-light text-gray-500 mt-2">
            Your rent is high enough—your stress shouldn't be.
          </span>
        </h1>
        <div className="mt-4 max-w-xl bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm text-left">
          <dl>
            <dt className="text-lg font-bold text-gray-900 flex items-center gap-2 text-left">
              <span>Roommate App</span>
              <span className="italic text-gray-500 text-base">
                /'ru:m.meɪt/
              </span>
            </dt>
            <dd className="mt-1 text-base text-gray-700 text-left">
              <span className="font-semibold">noun</span>
              <span className="ml-2 text-gray-500">(app)</span>
              <p className="mt-1 text-sm">
                The app that keeps track of chores, expenses, and
                passive-aggressive notes - so you don't have to stick them on
                the fridge anymore.
              </p>
            </dd>
          </dl>
        </div>
      </section>
      <section className="h-6">
        <hr className="border-gray-300" />
        <Outlet />
      </section>
    </>
  );
}

export default UnauthenticatedLayout;
