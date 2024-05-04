import Task from '../models/task.model.js';
import {
  stopFacebookJob,
  stopCraigslistsJob,
  stopOfferUpJob,
  stopKarrotUpJob,
} from '../cron/cronJobs.js';
export const getTasks = async (req, res) => {
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = req.user.id;
    console.log('userId: ' + userId);
    const tasks = await Task.find({
      userId,
      status: { $nin: ['Deleted', 'Archived'] },
    });

    console.log('tasks: ' + tasks);
    return res.status(200).send({
      message: 'successfully retrieved Tasks',
      success: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
export const createTask = async (req, res) => {
  try {
    const userId = req?.user?.id;

    console.log('creating task', req.body);
    const newTasks = new Task({
      name: req?.body?.name,
      email: req?.body?.email,
      platform: req?.body?.platform,
      tags: req?.body?.tags,
      blockedKeyWords: req?.body?.blockedKeyWords,
      minPrice: req?.body?.minPrice,
      maxPrice: req?.body?.maxPrice,
      postalCode: req?.body?.postalCode,
      radius: req?.body?.radius,
      timezone: req?.body?.timezone,
      interval: req?.body?.interval,
      startTime: req?.body?.startTime,
      endTime: req?.body?.endTime,
      status: req?.body?.status,
      cronSchedule: req?.body?.cronSchedule,
      location: req?.body?.location,
      userId,
    });
    await newTasks.save();
    return res.status(201).send({
      message: 'successfully created a new task',
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
export const updateTask = async (req, res) => {
  const taskId = req?.body.taskId;
  const dataToUpdate = req?.body?.dataToUpdate;
  console.log('req?.body', req?.body);

  try {
    const task = await Task.findById(taskId);
    if (task.platform == 'Facebook') {
      stopFacebookJob(task);
    }
    if (task.platform == 'Craigslist') {
      stopCraigslistsJob(task);
    }
    if (task.platform == 'OfferUp') {
      stopOfferUpJob(task);
    }
    if (task.platform == 'Karrot') {
      stopKarrotUpJob(task);
    }
    const updatedTask = await Task.updateOne(
      { _id: taskId }, // Filter condition to match the document
      { $set: dataToUpdate } // The update operation
    );

    return res.status(201).send({
      message: 'successfully updated task',
      success: true,
      updatedTask,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
