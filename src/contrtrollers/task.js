import Task from '../models/task.model.js';
import { stopFacebookJob } from '../cron/cronJobs.js';
import { callScrapper } from '../cron/queue.js';
export const getTasks = async (req, res) => {
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = req.user.id;

    const tasks = await Task.find({
      userId,
      status: { $nin: ['Deleted', 'Archived'] },
    }).sort({ updatedAt: -1 });

    console.log('tasks was retrieved');
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

    const newTask = new Task({
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
      url: req?.body?.url,
      userId,
      sendNotificationEmail: req?.body?.sendNotificationEmail,
    });
    // Save the new task and retrieve the saved task document which includes the _id
    const savedTask = await newTask.save();

    const data = {
      url: savedTask?.url,
      scrollTime: 15000,
      _id: savedTask?._id,
      userId: savedTask?.userId,
      email: savedTask?.email,
      radius: savedTask?.radius,
      postalCode: savedTask?.postalCode,
      blockedKeyWords: savedTask?.blockedKeyWords,
    };
    callScrapper([JSON.stringify(data)], true);

    return res.status(201).send({
      message: 'successfully created a new task',
      success: true,
      task: savedTask,
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
  // console.log('req?.body', req?.body);

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId }, // Filter condition to match the document
      { $set: dataToUpdate }, // The update operation
      { new: true } // Return the modified document rather than the original
    );
    const data = {
      url: updatedTask?.url,
      scrollTime: 15000,
      _id: updatedTask?._id,
      userId: updatedTask?.userId,
      email: updatedTask?.email,
      radius: updatedTask?.radius,
      postalCode: updatedTask?.postalCode,
      blockedKeyWords: updatedTask?.blockedKeyWords,
    };
    stopFacebookJob(data);
    callScrapper([JSON.stringify(data)], true);
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
