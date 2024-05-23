import { CronJob } from 'cron';
import Task from '../models/task.model.js'; // Assuming you have a Job model
import { pushTasksToQueue, runTasksInQueue } from './queue.js';

// all jobs scheduled for all platforms
let facebookScheduledJobs = {};

// stop jobs needed when the task is updated
export const stopFacebookJob = (job) => {
  if (facebookScheduledJobs[job._id]) {
    // If the job is not 'Active' but is present in facebookScheduledJobs, cancel and delete it.
    facebookScheduledJobs[job._id].stop(); // Stop the cron job
    delete facebookScheduledJobs[job._id]; // Remove it from the facebookScheduledJobs
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
      const tasks = await Task.find({ platform: 'Facebook' });

      tasks.forEach((task) => {
        // If the job is 'Active' and not already scheduled
        if (task.status === 'Active' && !facebookScheduledJobs[task._id]) {
          facebookScheduledJobs[task._id] = new CronJob(
            task.cronSchedule,
            () => {
              console.log(`Executing job: ${task.name}`);
              // Your job execution logic to genrate url and scrollTime to append to task
              let url = '';
              let scrollTime =
                parseInt(task?.interval) <= 3
                  ? 13000
                  : parseInt(task?.interval) <= 10
                  ? 15000
                  : 20000;

              const data = {
                url: task?.url,
                scrollTime,
                _id: task?._id,
                userId: task?.userId,
                email: task?.email,
                radius: task?.radius,
                postalCode: task?.postalCode,
                blockedKeyWords: task?.blockedKeyWords,
                sendNotificationEmail: task?.sendNotificationEmail,
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
