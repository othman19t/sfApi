import { CronJob } from 'cron';
import Task from './models/task.model.js'; // Assuming you have a Job model

export const runFacebookJobs = () => {
  console.log('Running runFacebookJobs');
  let scheduledJobs = {};

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Facebook' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !scheduledJobs[job._id]) {
          scheduledJobs[job._id] = new CronJob(
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
        } else if (job.status !== 'Active' && scheduledJobs[job._id]) {
          // If the job is not 'Active' but is present in scheduledJobs, cancel and delete it.
          scheduledJobs[job._id].stop(); // Stop the cron job
          delete scheduledJobs[job._id]; // Remove it from the scheduledJobs
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

export const runCraigslistJobs = () => {
  console.log('Running runCraigslistJobs');
  let scheduledJobs = {};

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Craigslist' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !scheduledJobs[job._id]) {
          scheduledJobs[job._id] = new CronJob(
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
        } else if (job.status !== 'Active' && scheduledJobs[job._id]) {
          // If the job is not 'Active' but is present in scheduledJobs, cancel and delete it.
          scheduledJobs[job._id].stop(); // Stop the cron job
          delete scheduledJobs[job._id]; // Remove it from the scheduledJobs
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

export const runOfferUpJobs = () => {
  console.log('Running runOfferUpJobs');
  let scheduledJobs = {};

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Offerup' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !scheduledJobs[job._id]) {
          scheduledJobs[job._id] = new CronJob(
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
        } else if (job.status !== 'Active' && scheduledJobs[job._id]) {
          // If the job is not 'Active' but is present in scheduledJobs, cancel and delete it.
          scheduledJobs[job._id].stop(); // Stop the cron job
          delete scheduledJobs[job._id]; // Remove it from the scheduledJobs
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

export const runKarrotJobs = () => {
  console.log('Running runKarrotJobs');
  let scheduledJobs = {};

  const checkAndScheduleJobs = async () => {
    console.log('running checkAndScheduleJobs');
    try {
      // Fetch all jobs from your database
      const jobs = await Task.find({ platform: 'Karrot' });

      jobs.forEach((job) => {
        // If the job is 'Active' and not already scheduled
        if (job.status === 'Active' && !scheduledJobs[job._id]) {
          scheduledJobs[job._id] = new CronJob(
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
        } else if (job.status !== 'Active' && scheduledJobs[job._id]) {
          // If the job is not 'Active' but is present in scheduledJobs, cancel and delete it.
          scheduledJobs[job._id].stop(); // Stop the cron job
          delete scheduledJobs[job._id]; // Remove it from the scheduledJobs
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
