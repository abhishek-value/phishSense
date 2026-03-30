const Popup = () => {
  return (
    <div className="w-[380px] min-h-[500px] bg-slate-950 text-white p-4">
      <h1 className="text-lg font-bold">🛡️ PhishSense AI</h1>
      <p className="text-sm text-slate-400 mt-1">Open an email in Gmail or Outlook to scan it.</p>
      <button id="scan-email" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Scan Email</button>
    </div>
  );
};

export default Popup;