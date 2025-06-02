import React, { useState } from 'react';

const JobshopContraintesForm = () => {
    const [jobNames, setJobNames] = useState([]);
    const [machineNames, setMachineNames] = useState([]);
    const [jobsData, setJobsData] = useState([]);
    const [dueDates, setDueDates] = useState([]);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted with:', { jobNames, machineNames, jobsData, dueDates });
    };

    return (
        <div>
            <h2>Jobshop Contraintes Scheduling</h2>
            <form onSubmit={handleSubmit}>
                {/* Add form fields for jobNames, machineNames, jobsData, and dueDates */}
                <button type="submit">Schedule</button>
            </form>
            {result && (
                <div>
                    <h3>Results</h3>
                    <p>Makespan: {result.makespan}</p>
                    <p>Flowtime: {result.flowtime}</p>
                    <p>Retard cumulé: {result.retard_cumule}</p>
                </div>
            )}
        </div>
    );
};

export default JobshopContraintesForm; 