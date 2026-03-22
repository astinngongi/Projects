<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "dbstudent");
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    // ✅ CREATE
    case 'create':
        $lName  = trim($_POST['last_name'] ?? '');
        $fName  = trim($_POST['first_name'] ?? '');
        $mName  = trim($_POST['middle_name'] ?? '');
        $course = trim($_POST['course'] ?? '');
        $age    = intval($_POST['age'] ?? 0);

        if ($lName === '' || $fName === '' || $course === '' || $age <= 0) {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            break;
        }

        $stmt = $conn->prepare("INSERT INTO records (lName, fName, mName, course, age) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $lName, $fName, $mName, $course, $age);

        if ($stmt->execute() && $stmt->affected_rows === 1) {
            echo json_encode(["status" => "success", "message" => "Student added"]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
        }
        $stmt->close();
        break;

    // ✅ READ ALL
case 'read':
    $stmt = $conn->prepare(
        "SELECT id, lName, fName, mName, course, age FROM records ORDER BY id DESC"
    );
    $stmt->execute();
    $stmt->bind_result($id, $lName, $fName, $mName, $course, $age);

    $students = [];
    while ($stmt->fetch()) {
        $students[] = [
            "id"     => $id,
            "lName"  => $lName,
            "fName"  => $fName,
            "mName"  => $mName,
            "course" => $course,
            "age"    => $age
        ];
    }

    echo json_encode(["status" => "success", "data" => $students]);
    $stmt->close();
    break;

    // ✅ UPDATE
    case 'update':
        $id     = intval($_POST['id'] ?? 0);
        $lName  = trim($_POST['last_name'] ?? '');
        $fName  = trim($_POST['first_name'] ?? '');
        $mName  = trim($_POST['middle_name'] ?? '');
        $course = trim($_POST['course'] ?? '');
        $age    = intval($_POST['age'] ?? 0);

        if ($id <= 0 || $lName === '' || $fName === '' || $course === '' || $age <= 0) {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            break;
        }

        $stmt = $conn->prepare("UPDATE records SET lName=?, fName=?, mName=?, course=?, age=? WHERE id=?");
        $stmt->bind_param("ssssis", $lName, $fName, $mName, $course, $age, $id);

        if ($stmt->execute() && $stmt->affected_rows === 1) {
            echo json_encode(["status" => "success", "message" => "Student updated"]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
        }
        $stmt->close();
        break;

    // ✅ DELETE
    case 'delete':
        $id = intval($_POST['id'] ?? 0);

        if ($id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM records WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute() && $stmt->affected_rows === 1) {
            echo json_encode(["status" => "success", "message" => "Student deleted"]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;

    // ✅ SEARCH
case 'search':
    $keyword = "%" . trim($_POST['keyword'] ?? '') . "%";

    $stmt = $conn->prepare(
        "SELECT id, lName, fName, mName, course, age FROM records
         WHERE lName LIKE ? OR fName LIKE ? OR mName LIKE ? OR course LIKE ?
         ORDER BY id DESC"
    );

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        break;
    }

    $stmt->bind_param("ssss", $keyword, $keyword, $keyword, $keyword);
    $stmt->execute();

    // ✅ bind result columns instead of get_result()
    $stmt->bind_result($id, $lName, $fName, $mName, $course, $age);

    $students = [];
    while ($stmt->fetch()) {
        $students[] = [
            "id"     => $id,
            "lName"  => $lName,
            "fName"  => $fName,
            "mName"  => $mName,
            "course" => $course,
            "age"    => $age
        ];
    }

    echo json_encode(["status" => "success", "data" => $students]);
    $stmt->close();
    break;
}

$conn->close();
?>