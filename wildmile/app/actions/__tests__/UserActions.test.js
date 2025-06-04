// wildmile/app/actions/__tests__/UserActions.test.js
import { updateUserStats } from '../UserActions';
import dbConnect from 'lib/db/setup';
import User from 'models/User';
import UserProgress from 'models/users/UserProgress';
import Observation from 'models/cameratrap/Observation';
import PlantObservation from 'models/PlantObservation';
import TrashLog from 'models/Trash'; // Assuming this is the correct path
import IndividualTrashItem from 'models/IndividualTrashItem'; // Assuming this is the correct path

// Mock models and functions
jest.mock('lib/db/setup', () => jest.fn(() => Promise.resolve()));
jest.mock('models/User');
jest.mock('models/users/UserProgress');
jest.mock('models/cameratrap/Observation');
jest.mock('models/PlantObservation');
jest.mock('models/Trash');
jest.mock('models/IndividualTrashItem');

const mockUserId = 'testUserId';

describe('updateUserStats - Streak Logic', () => {
    let mockUserProgressInstance;

    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        dbConnect.mockResolvedValue(); // Ensure dbConnect is mocked for each test

        User.findById.mockResolvedValue({
            _id: mockUserId,
            name: 'Test User',
            // toObject: jest.fn().mockReturnThis(), // if toObject is called for user data in return
        });

        // Default mock for UserProgress instance
        mockUserProgressInstance = {
            _id: 'progressId',
            user: mockUserId,
            streaks: { current: 0, longest: 0, lastActionDate: null },
            stats: { imagesReviewed: 0, animalsObserved: 0 /* other stats */ },
            achievements: [],
            domainRanks: new Map(),
            populate: jest.fn().mockReturnThis(), // Mock populate if called during the process
        };

        // UserProgress constructor mock
        UserProgress.mockImplementation(() => {
            // Ensure that any new instance created also points to our modifiable mock instance
            // This handles the case where UserProgress.findOne returns null
            Object.assign(mockUserProgressInstance, { user: mockUserId }); // reset basic fields
            return mockUserProgressInstance;
        });

        // UserProgress.findOne mock
        UserProgress.findOne.mockResolvedValue(mockUserProgressInstance);

        // Mock prototype methods that are called internally by updateUserStats
        UserProgress.prototype.save = jest.fn().mockResolvedValue(mockUserProgressInstance);
        UserProgress.prototype.checkAchievements = jest.fn().mockResolvedValue([]); // Returns newly earned
        UserProgress.prototype.populate = jest.fn().mockImplementation(function() { return this; });


        // Default empty responses for data fetching
        Observation.find.mockResolvedValue([]);
        PlantObservation.find.mockResolvedValue([]);
        TrashLog.aggregate.mockResolvedValue([]);
        IndividualTrashItem.aggregate.mockResolvedValue([]);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('1. No Actions: Streaks should be 0, lastActionDate null', async () => {
        jest.setSystemTime(new Date('2024-03-15T10:00:00.000Z'));
        UserProgress.findOne.mockResolvedValue(null); // Test creation path

        await updateUserStats(mockUserId);

        expect(UserProgress.prototype.save).toHaveBeenCalledTimes(1);
        expect(mockUserProgressInstance.streaks.current).toBe(0);
        expect(mockUserProgressInstance.streaks.longest).toBe(0);
        expect(mockUserProgressInstance.streaks.lastActionDate).toBeNull();
    });

    test('2. Single Action: Current streak 1, longest 1, lastActionDate is action date', async () => {
        const actionDate = new Date('2024-03-14T12:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-15T10:00:00.000Z')); // "Today" is the 15th

        Observation.find.mockResolvedValue([{ _id: 'obs1', creator: mockUserId, createdAt: actionDate, mediaId: 'media1' }]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(1);
        expect(mockUserProgressInstance.streaks.longest).toBe(1);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(actionDate);
    });

    test('3. Consecutive Daily Actions: Current streak 2, longest 2', async () => {
        const day1 = new Date('2024-03-13T12:00:00.000Z');
        const day2 = new Date('2024-03-14T15:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-14T18:00:00.000Z')); // "Today" is the 14th, same day as last action

        Observation.find.mockResolvedValue([{ _id: 'obs1', creator: mockUserId, createdAt: day1, mediaId: 'media1' }]);
        PlantObservation.find.mockResolvedValue([{ _id: 'plantObs1', observedBy: mockUserId, createdAt: day2 }]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(2);
        expect(mockUserProgressInstance.streaks.longest).toBe(2);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(day2);
    });

    test('4. Streak Reset (Missed Day): Current streak 1, longest from previous streak', async () => {
        const day1 = new Date('2024-03-10T12:00:00.000Z'); // Ends a streak of 1
        const dayXplus3 = new Date('2024-03-13T10:00:00.000Z'); // New action after missing 2 days
        jest.setSystemTime(new Date('2024-03-13T18:00:00.000Z')); // "Today" is the 13th

        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: day1, mediaId: 'media1' },
            { _id: 'obs2', creator: mockUserId, createdAt: dayXplus3, mediaId: 'media2' },
        ]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(1); // Current streak is 1 from dayXplus3
        expect(mockUserProgressInstance.streaks.longest).toBe(1); // Longest streak from day1 was 1
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayXplus3);
    });

    test('4.b Streak Reset (Missed Day, more complex): Current streak 1, longest from previous streak of 2', async () => {
        const day1 = new Date('2024-03-10T12:00:00.000Z');
        const day2 = new Date('2024-03-11T12:00:00.000Z'); // Streak of 2
        const dayXplus3 = new Date('2024-03-14T10:00:00.000Z'); // New action after missing 2 days (12th, 13th)
        jest.setSystemTime(new Date('2024-03-14T18:00:00.000Z')); // "Today" is the 14th

        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: day1, mediaId: 'media1' },
            { _id: 'obs2', creator: mockUserId, createdAt: day2, mediaId: 'media2' },
            { _id: 'obs3', creator: mockUserId, createdAt: dayXplus3, mediaId: 'media3' },
        ]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(1);
        expect(mockUserProgressInstance.streaks.longest).toBe(2);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayXplus3);
    });


    test('5. Longest Streak Preservation: Current reset, longest preserved', async () => {
        const day1 = new Date('2024-03-10T08:00:00.000Z');
        const day2 = new Date('2024-03-11T09:00:00.000Z'); // Streak of 2
        const dayXplus5 = new Date('2024-03-15T10:00:00.000Z'); // New action, today is 15th
        jest.setSystemTime(new Date('2024-03-15T18:00:00.000Z'));

        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: day1, mediaId: 'media1' },
            { _id: 'obs2', creator: mockUserId, createdAt: day2, mediaId: 'media2' },
        ]);
        PlantObservation.find.mockResolvedValue([
            { _id: 'plantObs1', observedBy: mockUserId, createdAt: dayXplus5 },
        ]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(1);
        expect(mockUserProgressInstance.streaks.longest).toBe(2);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayXplus5);
    });

    test('6. Multiple Actions on Same Day: Streak 1, lastActionDate is that day', async () => {
        const dayX_9AM = new Date('2024-03-10T09:00:00.000Z');
        const dayX_5PM = new Date('2024-03-10T17:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-10T18:00:00.000Z')); // Today is Day X

        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: dayX_9AM, mediaId: 'media1' },
        ]);
        PlantObservation.find.mockResolvedValue([
            { _id: 'plantObs1', observedBy: mockUserId, createdAt: dayX_5PM },
        ]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(1);
        expect(mockUserProgressInstance.streaks.longest).toBe(1);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayX_5PM); // latest action on that day
    });

    test('7. Existing Longest Streak: New actions form shorter streak, longest preserved', async () => {
        const dayY = new Date('2024-03-13T12:00:00.000Z');
        const dayYplus1 = new Date('2024-03-14T12:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-14T18:00:00.000Z')); // Today is Day Y+1

        // Pre-existing progress with a longer streak
        const initialProgress = {
            ...mockUserProgressInstance, // spread default mock values
            streaks: { current: 0, longest: 5, lastActionDate: new Date('2024-03-01T10:00:00.000Z') },
        };
        Object.assign(mockUserProgressInstance, initialProgress); // Make sure our global mock is this one
        UserProgress.findOne.mockResolvedValue(mockUserProgressInstance);


        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: dayY, mediaId: 'media1' },
            { _id: 'obs2', creator: mockUserId, createdAt: dayYplus1, mediaId: 'media2' },
        ]);
        PlantObservation.find.mockResolvedValue([]);


        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(2);
        expect(mockUserProgressInstance.streaks.longest).toBe(5); // Preserved from initial
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayYplus1);
    });

    test('8. New Longest Streak: New actions form streak longer than existing longest', async () => {
        const dayZ = new Date('2024-03-12T10:00:00.000Z');
        const dayZplus1 = new Date('2024-03-13T11:00:00.000Z');
        const dayZplus2 = new Date('2024-03-14T12:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-14T18:00:00.000Z')); // Today is Day Z+2

        const initialProgress = {
            ...mockUserProgressInstance,
            streaks: { current: 0, longest: 2, lastActionDate: new Date('2024-03-01T10:00:00.000Z') },
        };
        Object.assign(mockUserProgressInstance, initialProgress);
        UserProgress.findOne.mockResolvedValue(mockUserProgressInstance);

        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: dayZ, mediaId: 'media1' },
            { _id: 'obs3', creator: mockUserId, createdAt: dayZplus2, mediaId: 'media3' },
        ]);
        PlantObservation.find.mockResolvedValue([
            { _id: 'plantObs1', observedBy: mockUserId, createdAt: dayZplus1 },
        ]);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(3);
        expect(mockUserProgressInstance.streaks.longest).toBe(3); // Updated to new longest
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayZplus2);
    });

    test('Streak remains active if last action was yesterday', async () => {
        const yesterday = new Date('2024-03-14T12:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-15T10:00:00.000Z')); // Today is the 15th

        Observation.find.mockResolvedValue([{ _id: 'obs1', creator: mockUserId, createdAt: yesterday, mediaId: 'media1' }]);
        UserProgress.findOne.mockResolvedValue(null); // New user

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(1);
        expect(mockUserProgressInstance.streaks.longest).toBe(1);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(yesterday);
    });

    test('Streak becomes 0 if last action was day before yesterday', async () => {
        const dayBeforeYesterday = new Date('2024-03-13T12:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-15T10:00:00.000Z')); // Today is the 15th

        Observation.find.mockResolvedValue([{ _id: 'obs1', creator: mockUserId, createdAt: dayBeforeYesterday, mediaId: 'media1' }]);
        UserProgress.findOne.mockResolvedValue(null); // New user

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(0); // Reset because action was day before yesterday
        expect(mockUserProgressInstance.streaks.longest).toBe(1); // Longest was 1 from that single action
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(dayBeforeYesterday);
    });

    test('Actions on the same day, then consecutive day, streak should be 2', async () => {
        const day1_action1 = new Date('2024-03-13T10:00:00.000Z');
        const day1_action2 = new Date('2024-03-13T15:00:00.000Z');
        const day2_action1 = new Date('2024-03-14T10:00:00.000Z');
        jest.setSystemTime(new Date('2024-03-14T18:00:00.000Z')); // Today is day 2

        Observation.find.mockResolvedValue([
            { _id: 'obs1', creator: mockUserId, createdAt: day1_action1, mediaId: 'media1' },
            { _id: 'obs2', creator: mockUserId, createdAt: day2_action1, mediaId: 'media2' },
        ]);
        PlantObservation.find.mockResolvedValue([
            { _id: 'plantobs1', observedBy: mockUserId, createdAt: day1_action2 },
        ]);
        UserProgress.findOne.mockResolvedValue(null);

        await updateUserStats(mockUserId);

        expect(mockUserProgressInstance.streaks.current).toBe(2);
        expect(mockUserProgressInstance.streaks.longest).toBe(2);
        expect(mockUserProgressInstance.streaks.lastActionDate).toEqual(day2_action1);
    });
});

// Ensure all model mocks that have prototype methods are correctly set up
// If UserProgress constructor is used with `new UserProgress(...)`, its mock needs to return
// an object that can have `save`, `checkAchievements`, `populate` called on it.
// The current setup with UserProgress.mockImplementation and assigning to mockUserProgressInstance
// inside it, along with UserProgress.findOne.mockResolvedValue(mockUserProgressInstance)
// and UserProgress.prototype mocks, should cover these cases.
// The key is that the `progress` object inside `updateUserStats` must be our `mockUserProgressInstance`.

// One adjustment for UserProgress.findOne when it returns null (new user):
// UserProgress constructor is `UserProgress.mockImplementation(() => mockUserProgressInstance);`
// This ensures that `new UserProgress()` inside `updateUserStats` returns our controllable instance.
// We need to reset parts of `mockUserProgressInstance` for "new user" tests if it's reused.
// A cleaner way for `UserProgress.findOne.mockResolvedValue(null)`:
// In such tests, `mockUserProgressInstance` should be reset to a "new" state before `updateUserStats` runs.
// The current structure in `beforeEach` re-creates `mockUserProgressInstance` with defaults,
// and `UserProgress.mockImplementation` makes `new UserProgress()` return this fresh instance.
// This should work.
// For tests where `UserProgress.findOne` returns an existing progress (like test 7, 8),
// we are correctly assigning a specific state to `mockUserProgressInstance` *after* the
// default `beforeEach` setup but *before* `UserProgress.findOne.mockResolvedValue(mockUserProgressInstance)`.
// No, UserProgress.findOne.mockResolvedValue needs to be set with the specific instance for those tests.

// Corrected setup for tests 7 & 8 (and similar):
// In `beforeEach`:
// UserProgress.findOne.mockImplementation(() => {
//   // Default to returning the standard mockUserProgressInstance
//   // Tests can override this by setting a new mockResolvedValue for UserProgress.findOne
//   return Promise.resolve(mockUserProgressInstance);
// });

// Then in test 7:
// const initialProgress = { ... };
// UserProgress.findOne.mockResolvedValue(initialProgress);
// // And make sure that this initialProgress has save/checkAchievements mocks if they are called on IT.
// // The simplest is to ensure that updateUserStats always operates on the *same* object instance.
// // My current approach in beforeEach making UserProgress.mockImplementation return mockUserProgressInstance
// // and UserProgress.findOne also return mockUserProgressInstance ensures this.
// // So, for test 7, I need to modify mockUserProgressInstance *before* it's returned by findOne.
// This is what I did by Object.assign(mockUserProgressInstance, initialProgress);
// And then UserProgress.findOne.mockResolvedValue(mockUserProgressInstance);
// This is correct.

```
