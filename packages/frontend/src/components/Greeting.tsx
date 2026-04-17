type GreetingProps = {
  userName: string;
}

export function Greeting({ userName }: GreetingProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {userName}!
      </h1>
      <p className="text-gray-600 mt-2">
        Here's your weather dashboard overview.
      </p>
    </div>
  );
}
