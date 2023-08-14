import React, { useState } from "react"
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons"
import { Button, notification } from "antd"
import "./App.css"

const App = () => {
  const [groups, setGroups] = useState([{ name: "Group 1", from: 1, to: 10 }])
  const [groupStatuses, setGroupStatuses] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [hasError, setHasError] = useState(false)

  const openNotification = (message, description) => {
    notification.open({
      message,
      description,
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      duration: 4,
    })
  }

  const handleCreateGroup = () => {
    const lastGroup = groups[groups.length - 1]
    const newGroupFrom = Math.max(
      lastGroup.to + 1,
      Math.max(...groups.map((group) => group.to)) + 1
    )
    const newGroupTo = 10
    const newGroupName = `Group ${groups.length + 1}`

    if (newGroupFrom >= 1 && newGroupFrom <= 10) {
      const isInvalidGroup = groups.some(
        (group) =>
          (newGroupFrom >= group.from && newGroupFrom <= group.to) ||
          (newGroupTo >= group.from && newGroupTo <= group.to) ||
          (newGroupFrom <= group.from && newGroupTo >= group.from)
      )

      const isConflict = groups
        .slice(0, groups.length - 1)
        .some((group) => newGroupFrom >= group.from && newGroupFrom <= group.to)
      console.log(newGroupFrom, "newGroupFrom")
      if (
        newGroupFrom <= newGroupTo &&
        !isInvalidGroup &&
        newGroupFrom > Math.max(...groups.map((group) => group.to)) &&
        !isConflict
      ) {
        const newGroup = {
          name: newGroupName,
          from: newGroupFrom,
          to: newGroupTo,
        }

        setGroups([...groups, newGroup])
        setHasError(false)
      } else {
        if (newGroupFrom > newGroupTo) {
          setHasError(true)
          openNotification(
            "Invalid Group",
            "Group 'from' value should not be greater than 'to' value."
          )
        } else if (isInvalidGroup) {
          setHasError(true)
          openNotification(
            "Invalid Group",
            "Group range overlaps with an existing group or starts with a number that exists in the previous group."
          )
        } else if (
          newGroupFrom <= Math.max(...groups.map((group) => group.to))
        ) {
          setHasError(true)
          openNotification(
            "Invalid Group",
            "Group 'from' value should be greater than the highest 'to' value of previous groups."
          )
        }
      }
    } else {
      setHasError(true)
      openNotification("Invalid Group", "Group range should be within 1 to 10.")
    }
  }

  const handleDeleteGroup = (index) => {
    if (index !== 0) {
      const updatedGroups = groups.filter((_, i) => i !== index)
      setGroups(updatedGroups)
    } else {
      openNotification(
        "Cannot Delete Group",
        "You cannot delete the first group."
      )
    }
  }

  const handleEditFromTo = (index, field, value) => {
    const newValue = parseInt(value)

    if (newValue >= 1 && newValue <= 10) {
      const isConflict = groups
        .slice(0, index)
        .some((group) => newValue >= group.from && newValue <= group.to)

      if (isConflict) {
        setHasError(true)
        openNotification(
          "Invalid Input",
          "The new group should not start with a number that exists in the range of any previous group."
        )
      } else {
        const updatedGroups = groups.map((group, i) => {
          if (i === index) {
            return { ...group, [field]: newValue }
          }
          return group
        })

        setGroups(updatedGroups)
      }
    } else if (newValue < 1 || newValue > 10) {
      openNotification(
        "Invalid Input",
        "Please enter a valid number between 1 and 10."
      )
    }
  }

  const handleShowStatus = async () => {
    try {
      const groupPromises = groups.map(async (group) => {
        const statuses = await Promise.all(
          Array.from({ length: group.to - group.from + 1 }, (_, i) =>
            fetch(
              `https://jsonplaceholder.typicode.com/todos/${group.from + i}`
            ).then((response) => response.json())
          )
        )

        return statuses
      })

      const groupStatuses = await Promise.all(groupPromises)
      setGroupStatuses(groupStatuses)
      setShowResults(true)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      {groups.map((group, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "5px",
            padding: "10px",
          }}
        >
          <div
            style={{ cursor: "pointer", marginRight: "15px" }}
            onClick={() => handleDeleteGroup(index)}
          >
            <DeleteOutlined style={{ color: "blue" }} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "300px",
              marginRight: "20px",
              borderRadius: "3px",
              border: "1px solid gray",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderRight: "1px solid lightgray",
                padding: "11px",
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <input
                style={{
                  border: "none",
                  padding: "0",
                  width: "100%",
                  outline: "none",
                  backgroundColor: "#f0f0f0",
                }}
                className="groupinput"
                type="text"
                placeholder="Group Name"
                defaultValue={group.name}
                onChange={(e) => {
                  const updatedGroups = [...groups]
                  updatedGroups[index].name = e.target.value
                  setGroups(updatedGroups)
                }}
              />
            </div>
            <div
              style={{
                borderRight: "1px solid lightgray",
                padding: "10px",
                width: "40px",
                textAlign: "center",
              }}
            >
              <input
                style={{
                  border: "none",
                  padding: "0",
                  height: "100%",
                  width: "100%",
                  textAlign: "center",
                }}
                type="text"
                defaultValue={group.from}
                onChange={(e) =>
                  handleEditFromTo(index, "from", e.target.value)
                }
              />
            </div>
            <div
              style={{
                borderRight: "1px solid lightgray",
                padding: "10px",
                width: "40px",
                textAlign: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <ArrowRightOutlined style={{ color: "blue", fontSize: "16px" }} />
            </div>
            <div
              style={{
                padding: "10px",
                width: "60px",
                textAlign: "center",
              }}
            >
              <input
                style={{
                  border: "none",
                  padding: "0",
                  height: "100%",
                  width: "100%",
                  textAlign: "center",
                }}
                type="text"
                defaultValue={group.to}
                onChange={(e) => handleEditFromTo(index, "to", e.target.value)}
              />
            </div>
          </div>

          {showResults && (
            <input
              readOnly
              style={{
                border: "1px solid gray",
                borderRadius: "5px",
                padding: "10px",
                width: "300px",
                height: "20px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              value={
                groupStatuses[index] &&
                groupStatuses[index]
                  .map(
                    (status, statusIndex) =>
                      `(${group.from + statusIndex}) ${
                        status.completed ? "True" : "False"
                      }${
                        statusIndex < groupStatuses[index].length - 1
                          ? " | "
                          : ""
                      }`
                  )
                  .join("")
              }
            />
          )}
        </div>
      ))}
      <div
        style={{
          cursor: "pointer",
          display: "flex",
          marginRight: "185px",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleCreateGroup}
      >
        <span style={{ marginRight: "5px" }}>
          <i className="fa fa-plus" style={{ color: "blue" }}></i>
        </span>
        <span>Add Group</span>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Button
          className="button"
          onClick={() => {
            setShowResults(!showResults)
            if (!showResults && !hasError) {
              handleShowStatus()
            }
          }}
          style={{
            fontSize: "16px",
            backgroundColor: "#1976D2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            padding: "10px 20px",
            height: "45px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease",
          }}
          disabled={hasError}
        >
          Show Status
        </Button>
      </div>
    </div>
  )
}

export default App
