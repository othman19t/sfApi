import Task from '../models/task.model.js';
export const getTasks = async (req, res) => {
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ userId });

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
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = req?.user?.id;

    const newTasks = new Task({
      name: req?.body?.name,
      status: req?.body?.status,
      platform: req?.body?.platform,
      userId,
      url: req?.body?.url,
      schedule: req?.body?.schedule,
      tags: req?.body?.tags,
      blockedKeyWords: req?.body?.blockedKeyWords,
      radius: req?.body?.radius,
      postalCode: req?.body?.postalCode,
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
export const updateTask = async (req, res) => {};
