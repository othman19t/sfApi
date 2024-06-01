import { CronJob } from 'cron';
import Task from '../models/task.model.js'; // Assuming you have a Task model
import { callFacebookScrapper } from '../api/scrapper.js';
// import { getFacebookProxies } from '../utilities/proxies.js';
import dotenv from 'dotenv';
dotenv.config();
const backupIp = {
  host: process.env.BACK_UP_IP,
  port: process.env.BACK_UP_PORT,
  username: process.env.BACK_UP_USERNAME,
  password: process.env.BACK_UP_PASSWORD,
  proxiesName: 'backup',
};
const handleCallScrapper = async (tasks, firstTime = false) => {
  tasks.forEach(async (task) => {
    // const mainIps = await getFacebookProxies();
    const scrap = await callFacebookScrapper({
      task: task,
      mainIps: [],
      backupIp,
      firstTime,
    });
    console.log('scrap result: ', scrap?.message);
  });
};
export const callScrapper = handleCallScrapper;
// Helper function to send job parts
function sendJobPart(partTasks, partNumber, jobType) {
  if (partTasks?.length > 0) {
    handleCallScrapper(partTasks);
  }

  console.log(
    `scrapping part ${partNumber} for ${jobType} jobs with length:`,
    partTasks?.length
  );
}

// Function to handle jobs
function handleJobs(jobType, jobsArray, divideBy, intervalSeconds) {
  const totalJobs = jobsArray.length;
  if (totalJobs === 0) {
    console.log(`No jobs to process for ${jobType}`);
    return;
  }

  const jobParts = Array(divideBy)
    .fill()
    .map(() => []);
  for (let i = 0; i < totalJobs; i++) {
    jobParts[i % divideBy].push(jobsArray[i]);
  }

  let partCounter = 0;
  const interval = setInterval(() => {
    if (partCounter < jobParts.length) {
      sendJobPart(jobParts[partCounter], partCounter + 1, jobType);
      partCounter++;
    } else {
      clearInterval(interval);
    }
  }, intervalSeconds * 1000);
}

// Initialize job objects
const jobIntervals = {
  1: { jobs: {}, jobsToRun: [], divideBy: 3 },
  2: { jobs: {}, jobsToRun: [], divideBy: 6 },
  3: { jobs: {}, jobsToRun: [], divideBy: 9 },
  5: { jobs: {}, jobsToRun: [], divideBy: 15 },
  10: { jobs: {}, jobsToRun: [], divideBy: 30 },
  15: { jobs: {}, jobsToRun: [], divideBy: 45 },
  30: { jobs: {}, jobsToRun: [], divideBy: 90 },
};

// Stop job functions
const stopJob = (interval, task) => {
  //   console.log('stoped task interval', interval);
  const jobs = jobIntervals[interval].jobs;
  if (jobs[task._id]) {
    jobs[task._id].stop();
    delete jobs[task._id];
    // console.log(`Job ${task.name} canceled.`);
  }
};

export const stopJobs = {
  1: (task) => stopJob(1, task),
  2: (task) => stopJob(2, task),
  3: (task) => stopJob(3, task),
  5: (task) => stopJob(5, task),
  10: (task) => stopJob(10, task),
  15: (task) => stopJob(15, task),
  30: (task) => stopJob(30, task),
};

// Run jobs function for each interval
const runJobsForInterval = (interval) => {
  console.log(`Running ${interval} min jobs`);

  const checkAndScheduleJobs = async () => {
    console.log(`running checkAndScheduleJobs for ${interval} min`);
    try {
      const tasks = await Task.find({ interval: String(interval) });
      console.log('tasks found', tasks.length);

      for (const task of tasks) {
        if (
          task.status === 'Active' &&
          !jobIntervals[interval].jobs[task._id]
        ) {
          jobIntervals[interval].jobs[task._id] = new CronJob(
            task.cronSchedule,
            () => {
              console.log(`Executing job: ${task.name}`);
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
              jobIntervals[interval].jobsToRun.push(data);
            },
            null,
            true,
            task.timezone
          );

          console.log(
            `Job ${task.name}, cron schedule: ${task.cronSchedule}, scheduled with timezone ${task.timezone}.`
          );
        } else if (
          task.status !== 'Active' &&
          jobIntervals[interval].jobs[task._id]
        ) {
          stopJobs[interval](task);
        }
      }
    } catch (error) {
      console.error('Failed to check and schedule jobs:', error);
    }
  };

  new CronJob(`*/${interval} * * * *`, checkAndScheduleJobs, null, true);

  setInterval(() => {
    if (jobIntervals[interval].jobsToRun.length > 0) {
      handleJobs(
        `${interval} min`,
        jobIntervals[interval].jobsToRun,
        jobIntervals[interval].divideBy,
        20
      );
      jobIntervals[interval].jobsToRun = []; // Clear the array after processing
    }
  }, interval * 60000); // Interval in milliseconds
};

// Export run functions for all intervals
export const runJobs = () => {
  Object.keys(jobIntervals).forEach((interval) => {
    runJobsForInterval(parseInt(interval));
  });
};
