import { useEffect, useState } from 'react';
import './Home.css';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import { Search, X } from "react-feather";
export default function Home() {
    const [isOpened, setisOpened] = useState(false)
    const [categoryType, setcategoryType] = useState('Work')
    const [allTasks, setAllTasks] = useState([])
    const [theTask, setTheTask] = useState('')
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [date, setdate] = useState(null)
    const [time, setTime] = useState("00:00")
    const mainCategory = ['Personal', 'Work', 'Goal']
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const alltasks = allTasks.length
    const completedTasks = allTasks.filter(task => task.completed).length
    const progress = alltasks > 0 ? (completedTasks / alltasks) * 100 : 0
    function checkIfSelectIsOpen() {
        setisOpened(prevValue => !prevValue)
    }
    function addTaskToAllTasks() {
        if (!theTask.trim()) {
            toast.error('you should add task to submit')
            return;
        }
        const formattedDate = date
            ? new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : null;

        const task = {
            category: categoryType,
            task: theTask,
            id: crypto.randomUUID(),
            completed: false,
            dueDate: formattedDate,
            dueTime: formatTimeTo12Hour(time),
            pinned: false

        }
        setTheTask('')
        setdate(null)
        setTime("")
        const updatedTasks = [...allTasks, task]
        //nafs l haga bs deep copy w shallow copy
        //         const updatedTasks = structuredClone(allTasks);
        //         updatedTasks.push(task);
        setAllTasks(updatedTasks);
        localStorage.setItem('allSavedTasks', JSON.stringify(updatedTasks))

    }
    useEffect(() => {
        const savedTasks = localStorage.getItem('allSavedTasks')

        if (savedTasks) {
            setAllTasks(JSON.parse(savedTasks))
        }
    }, [])
    function deleteTask(id) {
        const updatedTasksAfterDelete = allTasks.filter(task => task.id !== id)
        setAllTasks(updatedTasksAfterDelete)
        localStorage.setItem('allSavedTasks', JSON.stringify(updatedTasksAfterDelete));
    }
    function formatTimeTo12Hour(time) {
        if (!time) return null;
        let [hour, minute] = time.split(":");
        hour = parseInt(hour);
        let period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${period}`;
    }
    function formatTimeTo24Hour(time) {
        if (!time || typeof time !== "string") return null;
        const match = time.match(/(\d+):(\d+)\s?(AM|PM)?/i);
        if (!match) return null; // Handle invalid input

        let [hour, minute, period] = match.slice(1);
        hour = parseInt(hour);

        if (period) {
            if (period.toUpperCase() === "PM" && hour !== 12) {
                hour += 12;
            } else if (period.toUpperCase() === "AM" && hour === 12) {
                hour = 0;
            }
        }

        return `${hour.toString().padStart(2, "0")}:${minute}`;
    }

    function updateTask(id, newTask, newCategory, newDate, newTime) {
        setEditingTaskId(id);
        setTheTask(newTask);
        setcategoryType(newCategory);

        // Convert 12-hour to 24-hour for editing
        const timeForUpdate = formatTimeTo24Hour(newTime);
        setTime(timeForUpdate);  // Set the time input to 24-hour format

        const formattedDate = newDate
            ? new Date(newDate).toString() === "Invalid Date"
                ? newDate
                : new Date(newDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            : null;

        setdate(formattedDate ? new Date(formattedDate) : null);

        const updatedTasksAfterUpdate = allTasks.map(task =>
            task.id === id
                ? {
                    ...task,
                    task: newTask,
                    category: newCategory,
                    dueDate: formattedDate,
                    dueTime: formatTimeTo12Hour(timeForUpdate)  // Convert back to 12-hour format for display
                }
                : task
        );

        setAllTasks(updatedTasksAfterUpdate);
        localStorage.setItem('allSavedTasks', JSON.stringify(updatedTasksAfterUpdate));
    }
    function handleAddOrUpdate() {
        if (editingTaskId) {
            updateTask(editingTaskId, theTask, categoryType, date, time)
            setEditingTaskId(null)
        }
        else {
            addTaskToAllTasks()
        }
        if (theTask.trim()) {
            setTheTask('');
            setdate(null);
            setTime('');
        }
    }
    function changeCompletedInFinishedTask(id) {
        const updatedTasks = allTasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task)
        setAllTasks(updatedTasks)
        localStorage.setItem('allSavedTasks', JSON.stringify(updatedTasks));
    }
    function dateSorting() {
        let sortedTasks = [...allTasks].sort((a, b) => {
            if (!a.dueDate && !b.dueDate) {
                if (!a.dueTime || !b.dueTime) return 0;
                if (!a.dueTime) return 1;
                if (!b.dueTime) return -1;

                return new Date(`1970-01-01T${formatTimeTo24Hour(a.dueTime)}`) -
                    new Date(`1970-01-01T${formatTimeTo24Hour(b.dueTime)}`);
            }

            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        setAllTasks(sortedTasks);
    }
    function pinTask(id) {
        const updatedTasksAfterPinned = allTasks.map(task => task.id === id ? { ...task, pinned: !task.pinned } : task
        ).sort((a, b) => b.pinned - a.pinned)
        setAllTasks(updatedTasksAfterPinned)
        localStorage.setItem('allSavedTasks', JSON.stringify(updatedTasksAfterPinned))
    }
    return <>
        <section className=" py-4 bg-gray-100 min-h-lvh flex flex-col">


            <h1 className="text-center text-teal-700 font-bold text-4xl" style={{ fontFamily: 'girlyFontFamily' }}> TO-DO List</h1>
            <div className="card py-5">
                {/* Mobile layout (shown on small screens) */}
                <div className="block sm:hidden">
                    <form className="w-[95%] sm:w-[65%] mx-auto">
                        <div className="flex flex-col sm:flex-row items-center w-full gap-2">
                            <div className="relative w-full sm:w-auto">
                                <input
                                    type="text"
                                    id="search-dropdown"
                                    className="block p-2  w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:ring-teal-500 focus:border-teal-500 focus:outline-none rounded-lg"
                                    placeholder="Enter your task..."
                                    required
                                    value={theTask}
                                    onChange={(e) => setTheTask(e.target.value)}
                                />
                            </div>

                            <div className="relative flex w-full ms-5 items-center gap-2">
                                <button
                                    type="button"
                                    id="category-dropdown"
                                    onClick={checkIfSelectIsOpen}
                                    className=" sm:w-auto shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-lg   focus:ring-teal-300 focus:outline-none focus:border-teal-500"
                                >
                                    {categoryType}
                                </button>
                                {isOpened && (
                                    <ul className="absolute left-0 z-20 min-w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
                                        {mainCategory.map((category) => (
                                            <li key={category}
                                                onClick={() => {
                                                    setcategoryType(category);
                                                    setisOpened(false);
                                                }}
                                                className="px-3 py-2 text-sm cursor-pointer">
                                                {category}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <DatePicker
                                    selected={date}
                                    onChange={(date) => setdate(date)}
                                    dateFormat="EEE, MMM d, yyyy"
                                    className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                                    popperPlacement="bottom-start"
                                    showPopperArrow={false}
                                    placeholderText="Select Date"
                                />

                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddOrUpdate}
                                    className="p-2 text-sm font-medium text-white bg-teal-700 border border-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 rounded-lg"
                                >
                                    {editingTaskId ? 'Save' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Desktop layout (shown on medium+ screens) */}
                <div className="hidden sm:block">
                    <form className="w-[95%] sm:w-[65%] mx-auto">
                        <div className="flex flex-col sm:flex-row items-center w-full gap-2">
                            <div className="relative w-full sm:w-auto">
                                <button
                                    type="button"
                                    id="category-dropdown"
                                    onClick={checkIfSelectIsOpen}
                                    className="w-full sm:w-auto shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-lg   focus:ring-teal-300 focus:outline-none focus:border-teal-500"
                                >
                                    {categoryType}
                                </button>
                                {isOpened && (
                                    <ul className="absolute left-0 z-20 min-w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
                                        {mainCategory.map((category) => (
                                            <li key={category}
                                                onClick={() => {
                                                    setcategoryType(category);
                                                    setisOpened(false);
                                                }}
                                                className="px-3 py-2 text-sm cursor-pointer">
                                                {category}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="relative flex w-full items-center gap-2">
                                <input
                                    type="text"
                                    id="search-dropdown"
                                    className="block p-2 w-[70%] text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:ring-teal-500 focus:border-teal-500 focus:outline-none rounded-lg"
                                    placeholder="Enter your task..."
                                    required
                                    value={theTask}
                                    onChange={(e) => setTheTask(e.target.value)}
                                />
                                <DatePicker
                                    selected={date}
                                    onChange={(date) => setdate(date)}
                                    dateFormat="EEE, MMM d, yyyy"
                                    className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                                    popperPlacement="bottom-start"
                                    showPopperArrow={false}
                                    placeholderText="Select Date"
                                />

                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddOrUpdate}
                                    className="p-2 text-sm font-medium text-white bg-teal-700 border border-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 rounded-lg"
                                >
                                    {editingTaskId ? 'Save' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>




                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full md:w-[70%] mx-auto mt-5">
                    {/* Non-Completed Tasks */}
                    <div className="p-4 bg-white shadow-md rounded-lg border w-[90%] max-w-[600px] mx-auto min-h-[150px] max-h-96 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-bold text-teal-700">Non-Completed Tasks</h2>
                            {allTasks.filter(task => !task.completed && (task.dueDate || task.dueTime)).length >= 2 && (
                                <button
                                    className="bg-teal-700 text-white px-3 py-2 text-sm rounded-md shadow-md hover:bg-teal-900 hover:shadow-lg transition-all flex items-center gap-1"
                                    onClick={dateSorting}
                                >
                                    <i className="fa-solid fa-sort text-white"></i>
                                    Sort
                                </button>
                            )}
                            {allTasks.filter(task => !task.completed).length >= 3 && !showSearch && (
                                <button
                                    onClick={() => setShowSearch(true)}
                                    className="text-gray-600 hover:text-teal-600"
                                    title="Search Tasks"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {showSearch && (
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg w-[90%] mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        )}

                        {showSearch && (
                            <button onClick={() => { setShowSearch(false); setSearchTerm(''); }} title="Close Search">
                                <X className="w-5 h-5 ms-3 text-gray-600 hover:text-red-500" />
                            </button>
                        )}

                        {allTasks.length > 0 && allTasks.filter(task => !task.completed).length === 0 ? (
                            <p className="text-gray-500 text-center mt-8 text-sm italic">
                                No pending tasks. Enjoy your day! 😊
                            </p>
                        ) : (
                            allTasks
                                .filter(task => !task.completed)
                                .filter(task => task.task.toLowerCase().includes(searchTerm.toLowerCase())) // Search filter
                                .sort((a, b) => b.pinned - a.pinned)
                                .map((task) => (
                                    <div key={task.id} className="bg-slate-200 border rounded p-2 shadow-md mb-2 grid grid-cols-2 items-center hover:bg-slate-300 transition duration-200">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" onChange={() => changeCompletedInFinishedTask(task.id)} checked={task.completed} className="accent-teal-700 cursor-pointer" />
                                            <p className="flex-1">
                                                <span className="font-bold">{task.category}</span> {task.task}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end text-gray-500 text-xs text-right">
                                            <span>{task.dueDate}</span>
                                            <span>{task.dueTime}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-1 mt-1">
                                            <i onClick={() => pinTask(task.id)} className={`cursor-pointer p-2 text-white fa-solid fa-thumbtack text-sm rounded ${task.pinned ? 'bg-teal-900' : 'bg-teal-800'}`}></i>
                                            <i onClick={() => updateTask(task.id, task.task, task.category, task.dueDate, task.dueTime)} className="cursor-pointer bg-teal-800 p-2 text-white fa-solid fa-edit text-sm rounded"></i>
                                            <i onClick={() => deleteTask(task.id)} className="cursor-pointer bg-teal-800 p-2 text-white text-sm fa-solid fa-trash rounded"></i>
                                        </div>
                                    </div>
                                ))
                        )}
                        {showSearch && allTasks
                            .filter(task => !task.completed)
                            .filter(task => !task.task.toLowerCase().includes(searchTerm.toLowerCase())).length === allTasks.filter(task => !task.completed).length && (
                                <p className="text-gray-500 text-center mt-8 text-sm italic">
                                    No tasks match your search. Try again! 😕
                                </p>
                            )}
                    </div>


                    {/* Completed Tasks */}
                    <div className="p-4 bg-white shadow-md rounded-lg border w-[90%] max-w-[600px] mx-auto min-h-[150px] max-h-96 overflow-y-auto custom-scrollbar">
                        <h2 className="text-xl font-bold text-teal-700 mb-3">Completed Tasks</h2>

                        {allTasks.length > 0 && allTasks.filter(task => task.completed).length === 0 ? (
                            <p className="text-gray-500 text-center mt-8 text-sm italic">
                                No completed tasks yet. Keep going! 🚀</p>
                        ) : (
                            allTasks
                                .filter(task => task.completed)
                                .map((task) => (
                                    <div key={task.id} className="bg-slate-200 border rounded p-2 shadow-md mb-2 grid grid-cols-2 items-center hover:bg-slate-300 transition duration-200">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" onChange={() => changeCompletedInFinishedTask(task.id)} checked={task.completed} className="accent-teal-700 cursor-pointer" />
                                            <p className="ml-2 line-through text-gray-600 flex-1">
                                                <span className="font-bold">{task.category}</span> {task.task}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end text-gray-500 text-xs text-right">
                                            <span>{task.dueDate}</span>
                                            <span>{task.dueTime}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-1 mt-1">
                                            <i onClick={() => deleteTask(task.id)} className="cursor-pointer bg-teal-800 p-2 text-white fa-solid fa-trash rounded text-sm"></i>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {allTasks.length > 0 && (
                    <div className="w-full flex justify-center">
                        <div className="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] my-4">
                            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mx-auto">
                                <motion.div
                                    className="h-4 bg-teal-800 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-gray-700 text-center mt-2">
                                {completedTasks} / {alltasks} task completed ({Math.round(progress)}%)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section >


    </>

}
