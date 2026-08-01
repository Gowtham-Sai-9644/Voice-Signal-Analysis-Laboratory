const Settings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">System Settings</h2>
      <div className="panel max-w-2xl">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select className="border border-laboratory-200 rounded p-2 w-full dark:bg-laboratory-800 dark:border-laboratory-700">
              <option>System Default</option>
              <option>Light Mode</option>
              <option>Dark Mode</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Settings;
