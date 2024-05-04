import { CronJob } from 'cron';
import Task from '../models/task.model.js'; // Assuming you have a Job model
import { pushTasksToQueue, runTasksInQueue } from './queue.js';

// all jobs scheduled for all platforms
let facebookScheduledJobs = {};
let craigslistScheduledJobs = {};
let OfferUpScheduledJobs = {};
let karrotScheduledJobs = {};
// stop jobs needed when the task is updated
export const stopFacebookJob = (job) => {
  if (facebookScheduledJobs[job._id]) {
    // If the job is not 'Active' but is present in facebookScheduledJobs, cancel and delete it.
    facebookScheduledJobs[job._id].stop(); // Stop the cron job
    delete facebookScheduledJobs[job._id]; // Remove it from the facebookScheduledJobs
    console.log(`Job ${job.name} canceled.`);
  }
};
export const stopCraigslistsJob = (job) => {
  if (craigslistScheduledJobs[job._id]) {
    // If the job is not 'Active' but is present in craigslistScheduledJobs, cancel and delete it.
    craigslistScheduledJobs[job._id].stop(); // Stop the cron job
    delete craigslistScheduledJobs[job._id]; // Remove it from the craigslistScheduledJobs
    console.log(`Job ${job.name} canceled.`);
  }
};
export const stopOfferUpJob = (job) => {
  if (OfferUpScheduledJobs[job._id]) {
    // If the job is not 'Active' but is present in OfferUpScheduledJobs, cancel and delete it.
    OfferUpScheduledJobs[job._id].stop(); // Stop the cron job
    delete OfferUpScheduledJobs[job._id]; // Remove it from the OfferUpScheduledJobs
    console.log(`Job ${job.name} canceled.`);
  }
};
export const stopKarrotUpJob = (job) => {
  if (karrotScheduledJobs[job._id]) {
    // If the job is not 'Active' but is present in karrotScheduledJobs, cancel and delete it.
    karrotScheduledJobs[job._id].stop(); // Stop the cron job
    delete karrotScheduledJobs[job._id]; // Remove it from the karrotScheduledJobs
    console.log(`Job ${job.name} canceled.`);
  }
};

export const runTasksQueue = async () => {
  const handleRunTasksInQueue = async () => {
    setTimeout(() => {
      runTasksInQueue('tasks');
    }, 5000);
  };

  new CronJob('*/1  * * * *', handleRunTasksInQueue, null, true);
};

// handles jobs scheduled for facebook
export const runFacebookJobs = () => {
  console.log('Running runFacebookJobs');

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const tasks = await Task.find({ platform: 'Facebook' }).populate(
        'location'
      );

      tasks.forEach((task) => {
        // If the job is 'Active' and not already scheduled
        if (task.status === 'Active' && !facebookScheduledJobs[task._id]) {
          facebookScheduledJobs[task._id] = new CronJob(
            task.cronSchedule,
            () => {
              console.log(`Executing job: ${task.name}`);
              // Your job execution logic to genrate url and scrollTime to append to task
              let url = '';
              let scrollTime = 5000;

              parseInt(task?.interval) <= 3
                ? 10000
                : parseInt(task?.interval) <= 10
                ? 20000
                : 30000;
              const tags = task?.tags.join(' '); // Join the array elements into a single string, separated by spaces
              var encodedQueryString = encodeURIComponent(tags); // Encode the query string to ensure it is a valid URL component
              if (task?.platform == 'Facebook') {
                url = `https://www.facebook.com/marketplace/${task?.location?.locationId}/search?minPrice=${task?.minPrice}&maxPrice=${task?.maxPrice}&daysSinceListed=1&query=${encodedQueryString}&exact=false`;
              }
              const data = {
                url,
                scrollTime,
                _id: task?._id,
                userId: task?.userId,
                email: task?.email,
                radius: task?.radius,
                postalCode: task?.postalCode,
                blockedKeyWords: task?.blockedKeyWords,
              };
              pushTasksToQueue('tasks', data);
            },
            null, // onComplete (optional)
            true, // Start the job right now
            task.timezone // Specify the time zone
          );

          console.log(
            `Job ${task.name}, cron schedule: ${task.cronSchedule}, scheduled with timezone ${task.timezone}.`
          );
        } else if (
          task.status !== 'Active' &&
          facebookScheduledJobs[task._id]
        ) {
          // If the job is not 'Active' but is present in facebookScheduledJobs, cancel and delete it.
          facebookScheduledJobs[task._id].stop(); // Stop the cron job
          delete facebookScheduledJobs[task._id]; // Remove it from the scheduledJobs
          console.log(`Job ${task.name} canceled.`);
        }
      });
    } catch (error) {
      console.error('Failed to check and schedule jobs:', error);
    }
  };

  // Assuming you want to run this check periodically you can also use a cron job for this
  new CronJob('*/1 * * * *', checkAndScheduleJobs, null, true);
};

// handles jobs scheduled for criaigslist
export const runCraigslistJobs = () => {
  console.log('Running runCraigslistJobs');

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Craigslist' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !craigslistScheduledJobs[job._id]) {
          craigslistScheduledJobs[job._id] = new CronJob(
            job.cronSchedule,
            () => {
              console.log(`Executing job: ${job.name}`);
              // Your job execution logic here
            },
            null, // onComplete (optional)
            true, // Start the job right now
            job.timezone // Specify the time zone
          );

          console.log(
            `Job ${job.name}, cron schedule: ${job.cronSchedule}, scheduled with timezone ${job.timezone}.`
          );
        } else if (
          job.status !== 'Active' &&
          craigslistScheduledJobs[job._id]
        ) {
          // If the job is not 'Active' but is present in craigslistScheduledJobs, cancel and delete it.
          craigslistScheduledJobs[job._id].stop(); // Stop the cron job
          delete craigslistScheduledJobs[job._id]; // Remove it from the craigslistScheduledJobs
          console.log(`Job ${job.name} canceled.`);
        }
      });
    } catch (error) {
      console.error('Failed to check and schedule jobs:', error);
    }
  };

  // Assuming you want to run this check periodically you can also use a cron job for this
  new CronJob('*/1 * * * *', checkAndScheduleJobs, null, true);
};

// handles jobs scheduled for offerUp
export const runOfferUpJobs = () => {
  console.log('Running runOfferUpJobs');

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Offerup' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !OfferUpScheduledJobs[job._id]) {
          OfferUpScheduledJobs[job._id] = new CronJob(
            job.cronSchedule,
            () => {
              console.log(`Executing job: ${job.name}`);
              // Your job execution logic here
            },
            null, // onComplete (optional)
            true, // Start the job right now
            job.timezone // Specify the time zone
          );

          console.log(
            `Job ${job.name}, cron schedule: ${job.cronSchedule}, scheduled with timezone ${job.timezone}.`
          );
        } else if (job.status !== 'Active' && OfferUpScheduledJobs[job._id]) {
          // If the job is not 'Active' but is present in OfferUpScheduledJobs, cancel and delete it.
          OfferUpScheduledJobs[job._id].stop(); // Stop the cron job
          delete OfferUpScheduledJobs[job._id]; // Remove it from the OfferUpScheduledJobs
          console.log(`Job ${job.name} canceled.`);
        }
      });
    } catch (error) {
      console.error('Failed to check and schedule jobs:', error);
    }
  };

  // Assuming you want to run this check periodically you can also use a cron job for this
  new CronJob('*/1 * * * *', checkAndScheduleJobs, null, true);
};

// handles jobs scheduled for karrot
export const runKarrotJobs = () => {
  console.log('Running runKarrotJobs');

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Karrot' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !karrotScheduledJobs[job._id]) {
          karrotScheduledJobs[job._id] = new CronJob(
            job.cronSchedule,
            () => {
              console.log(`Executing job: ${job.name}`);
              // Your job execution logic here
            },
            null, // onComplete (optional)
            true, // Start the job right now
            job.timezone // Specify the time zone
          );

          console.log(
            `Job ${job.name}, cron schedule: ${job.cronSchedule}, scheduled with timezone ${job.timezone}.`
          );
        } else if (job.status !== 'Active' && karrotScheduledJobs[job._id]) {
          // If the job is not 'Active' but is present in karrotScheduledJobs, cancel and delete it.
          karrotScheduledJobs[job._id].stop(); // Stop the cron job
          delete karrotScheduledJobs[job._id]; // Remove it from the karrotScheduledJobs
          console.log(`Job ${job.name} canceled.`);
        }
      });
    } catch (error) {
      console.error('Failed to check and schedule jobs:', error);
    }
  };

  // Assuming you want to run this check periodically you can also use a cron job for this
  new CronJob('*/1 * * * *', checkAndScheduleJobs, null, true);
};
