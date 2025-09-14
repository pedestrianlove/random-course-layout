// Course timetable renderer according to NTHU specifications
class TimetableRenderer {
    constructor() {
        this.courses = [];
        this.dayMap = {
            'M': 'Mon',
            'T': 'Tue', 
            'W': 'Wed',
            'R': 'Thu',
            'F': 'Fri',
            'S': 'Sat',
            'U': 'Sun'
        };
        
        // Time periods with their actual time slots according to NTHU spec
        this.periodTimes = {
            '1': '8:00-8:50',
            '2': '9:00-9:50',
            '3': '10:10-11:00',
            '4': '11:10-12:00',
            'n': '12:10-13:00',
            '5': '13:20-14:10',
            '6': '14:20-15:10',
            '7': '15:30-16:20',
            '8': '16:30-17:20',
            '9': '17:30-18:20',
            'a': '18:30-19:20',
            'b': '19:30-20:20',
            'c': '20:30-21:20',
            'd': '21:30-22:20'
        };
        
        this.periodOrder = ['1', '2', '3', '4', 'n', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'];
        this.dayOrder = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
        
        this.init();
    }
    
    init() {
        this.renderTimetableGrid();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const form = document.getElementById('courseForm');
        const clearAllBtn = document.getElementById('clearAll');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
        });
        
        clearAllBtn.addEventListener('click', () => {
            this.clearAll();
        });
    }
    
    parseTimeString(timeString) {
        // Parse time strings like "T3T4R3R4" or "M1M2M3"
        const timeString_upper = timeString.toUpperCase();
        const schedule = [];
        
        // Use regex to match day+period combinations
        const pattern = /([MTWRFSU])([1-9nabc])/g;
        let match;
        
        while ((match = pattern.exec(timeString_upper)) !== null) {
            const day = match[1];
            const period = match[2].toLowerCase(); // Convert to lowercase for periods
            
            if (this.dayMap[day] && this.periodTimes[period]) {
                schedule.push({
                    day: day,
                    period: period,
                    dayName: this.dayMap[day],
                    timeSlot: this.periodTimes[period]
                });
            }
        }
        
        return schedule;
    }
    
    addCourse() {
        const courseName = document.getElementById('courseName').value.trim();
        const courseTime = document.getElementById('courseTime').value.trim();
        const courseLocation = document.getElementById('courseLocation').value.trim();
        const courseInstructor = document.getElementById('courseInstructor').value.trim();
        
        if (!courseName || !courseTime) {
            alert('Please enter both course name and time.');
            return;
        }
        
        const schedule = this.parseTimeString(courseTime);
        
        if (schedule.length === 0) {
            alert('Invalid time format. Please use format like "T3T4R3R4" (Tue 3-4, Thu 3-4)');
            return;
        }
        
        const course = {
            id: Date.now(),
            name: courseName,
            timeString: courseTime,
            schedule: schedule,
            location: courseLocation,
            instructor: courseInstructor
        };
        
        this.courses.push(course);
        this.updateTimetable();
        this.clearForm();
    }
    
    clearForm() {
        document.getElementById('courseForm').reset();
    }
    
    clearAll() {
        this.courses = [];
        this.updateTimetable();
    }
    
    renderTimetableGrid() {
        const timetable = document.getElementById('timetable');
        timetable.innerHTML = '';
        
        // Header row
        timetable.appendChild(this.createCell('', 'time-header'));
        
        this.dayOrder.forEach(dayCode => {
            const dayName = this.dayMap[dayCode];
            timetable.appendChild(this.createCell(dayName, 'day-header'));
        });
        
        // Time rows
        this.periodOrder.forEach(period => {
            // Time header
            const timeText = `${period}\n${this.periodTimes[period]}`;
            const timeHeader = this.createCell(timeText, 'time-header');
            timetable.appendChild(timeHeader);
            
            // Day cells
            this.dayOrder.forEach(dayCode => {
                const cell = this.createCell('', 'time-cell');
                cell.dataset.day = dayCode;
                cell.dataset.period = period;
                
                // Add special styling for noon and evening periods
                if (period === 'n') {
                    cell.classList.add('period-n');
                } else if (['a', 'b', 'c', 'd'].includes(period)) {
                    cell.classList.add('period-evening');
                }
                
                timetable.appendChild(cell);
            });
        });
        
        this.updateTimetable();
    }
    
    createCell(content, className) {
        const cell = document.createElement('div');
        cell.className = className;
        cell.textContent = content;
        return cell;
    }
    
    updateTimetable() {
        // Clear all course blocks
        document.querySelectorAll('.course-block').forEach(block => block.remove());
        
        // Add course blocks
        this.courses.forEach(course => {
            course.schedule.forEach(slot => {
                const cell = document.querySelector(
                    `[data-day="${slot.day}"][data-period="${slot.period}"]`
                );
                
                if (cell) {
                    const courseBlock = this.createCourseBlock(course);
                    cell.appendChild(courseBlock);
                }
            });
        });
    }
    
    createCourseBlock(course) {
        const block = document.createElement('div');
        block.className = 'course-block';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'course-name';
        nameDiv.textContent = course.name;
        block.appendChild(nameDiv);
        
        if (course.location || course.instructor) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'course-details';
            const details = [];
            if (course.location) details.push(course.location);
            if (course.instructor) details.push(course.instructor);
            detailsDiv.textContent = details.join(' • ');
            block.appendChild(detailsDiv);
        }
        
        // Add click handler for course removal
        block.addEventListener('click', () => {
            if (confirm(`Remove course "${course.name}"?`)) {
                this.removeCourse(course.id);
            }
        });
        
        block.title = `${course.name}\nTime: ${course.timeString}\n${course.location ? 'Location: ' + course.location + '\n' : ''}${course.instructor ? 'Instructor: ' + course.instructor + '\n' : ''}Click to remove`;
        
        return block;
    }
    
    removeCourse(courseId) {
        this.courses = this.courses.filter(course => course.id !== courseId);
        this.updateTimetable();
    }
}

// Initialize the timetable renderer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimetableRenderer();
});