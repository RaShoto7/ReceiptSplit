import { createRoomAction } from '@/lib/actions';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ReceiptSplit
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Split bills easily with friends
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create a New Bill
        </h2>

        <form action={createRoomAction} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Bill Name (optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Dinner at Joe's"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="USD"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-lg shadow-sm"
          >
            Create Bill
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        No login required. Share the link to split!
      </p>
    </div>
  );
}
